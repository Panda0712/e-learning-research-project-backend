import { env } from "@/configs/environment.js";
import { prisma } from "@/lib/prisma.js";
import { BrevoProvider } from "@/providers/BrevoProvider.js";
import ApiError from "@/utils/ApiError.js";
import { authUtils } from "@/utils/auth.js";
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE, WEBSITE_DOMAINS, } from "@/utils/constants.js";
import { pickUser, pickUserWithAvatar } from "@/utils/helpers.js";
import axios from "axios";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidV4 } from "uuid";
import KeyTokenService from "./keyTokenService.js";
import { resourceService } from "./resourceService.js";
const issueAuthSession = async (user) => {
    // generate public and private key for tokens
    const publicKey = crypto.randomBytes(64).toString("hex");
    const privateKey = crypto.randomBytes(64).toString("hex");
    const kid = uuidV4();
    const tokensPair = (await authUtils.createTokenPair({
        id: user.id,
        email: user.email,
        role: user.role,
        kid,
    }, publicKey, privateKey));
    // create key token
    await KeyTokenService.createKeyToken({
        userId: user.id,
        refreshToken: tokensPair.refreshToken,
        publicKey,
        privateKey,
        kid,
    });
    return {
        refreshToken: tokensPair.refreshToken,
        accessToken: tokensPair.accessToken,
        kid,
    };
};
const handleRefreshToken = async ({ refreshToken, user, keyStore, }) => {
    try {
        const resolvedKeyStore = keyStore || (await KeyTokenService.findByRefreshToken(refreshToken));
        if (!resolvedKeyStore) {
            const usedTokenStore = await KeyTokenService.findByRefreshTokenUsed(refreshToken);
            if (usedTokenStore) {
                await KeyTokenService.deleteKeyById(usedTokenStore.userId);
                throw new ApiError(StatusCodes.FORBIDDEN, "Something wrong happened!");
            }
            throw new ApiError(StatusCodes.UNAUTHORIZED, "User not registered!");
        }
        const refreshTokenUsedList = Array.isArray(resolvedKeyStore.refreshTokenUsed)
            ? resolvedKeyStore.refreshTokenUsed.filter((token) => typeof token === "string")
            : [];
        const resolvedUser = user ||
            (await prisma.user.findFirst({
                where: { id: resolvedKeyStore.userId, isDestroyed: false },
            }));
        if (!resolvedUser) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, "User not registered!");
        }
        const { id, email, role } = resolvedUser;
        // check refreshTokenUsed array
        if (refreshTokenUsedList.includes(refreshToken)) {
            await KeyTokenService.deleteKeyById(id);
            throw new ApiError(StatusCodes.FORBIDDEN, "Something wrong happened!");
        }
        // check refreshToken
        if (resolvedKeyStore.refreshToken !== refreshToken) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, "User not registered!");
        }
        // check user
        const foundUser = await findByEmail({ email });
        if (!foundUser)
            throw new ApiError(StatusCodes.UNAUTHORIZED, "User not registered!");
        // create new tokens
        const tokens = (await authUtils.createTokenPair({
            id,
            email,
            role,
            kid: resolvedKeyStore.kid,
        }, resolvedKeyStore.publicKey, resolvedKeyStore.privateKey));
        // update key token table
        await prisma.keyToken.update({
            where: { id: resolvedKeyStore.id },
            data: {
                refreshToken: tokens.refreshToken,
                refreshTokenUsed: {
                    set: [...refreshTokenUsedList, refreshToken].filter((v, i, arr) => arr.indexOf(v) === i),
                },
            },
        });
        return {
            user: { id, email, role, kid: resolvedKeyStore.kid },
            tokens,
        };
    }
    catch (error) {
        throw error;
    }
};
const register = async (reqBody) => {
    try {
        // check user existence
        const checkUser = await prisma.user.findFirst({
            where: { email: reqBody.email, isDestroyed: false },
        });
        if (checkUser) {
            throw new ApiError(StatusCodes.CONFLICT, "User already exists!");
        }
        // hash the password
        const hashedPassword = await bcrypt.hash(reqBody.password, 10);
        // create user
        const newUser = await prisma.user.create({
            data: {
                firstName: reqBody.firstName,
                lastName: reqBody.lastName,
                email: reqBody.email,
                password: hashedPassword,
                verifyToken: uuidV4(),
            },
        });
        if (newUser) {
            // get created user
            const getNewUser = await prisma.user.findUnique({
                where: { id: newUser.id, isDestroyed: false },
            });
            if (!getNewUser) {
                throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Cannot get new user data! Please try again later!");
            }
            // send verification email to user
            const verificationLink = `${WEBSITE_DOMAINS}/auth/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`;
            const customSubject = "ADMIN EduLearn: Please verify your email!";
            const htmlContent = `
        <h3>This is verification email link:</h3>
        <h3>${verificationLink}</h3>
        <h3>Sincerely,<br/>- ADMIN EduLearn -</h3>
      `;
            await BrevoProvider.sendEmail({
                recipientEmail: getNewUser.email,
                subject: customSubject,
                htmlContent,
            });
            // return data
            return pickUser(getNewUser);
        }
    }
    catch (error) {
        throw error;
    }
};
const verifyAccount = async (reqBody) => {
    try {
        // check user existence
        const existingUser = await prisma.user.findUnique({
            where: { email: reqBody.email, isDestroyed: false },
        });
        if (!existingUser)
            throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
        if (existingUser.isVerified)
            throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Your account is already activated!");
        if (reqBody.token !== existingUser.verifyToken)
            throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Token is invalid!");
        // update user
        const updateData = {
            isVerified: true,
            verifyToken: null,
        };
        const updatedUser = await prisma.user.update({
            where: { id: existingUser.id },
            data: updateData,
        });
        return pickUser(updatedUser);
    }
    catch (error) {
        throw error;
    }
};
const logout = async ({ keyStore }) => {
    if (!keyStore)
        return true;
    const delKey = await KeyTokenService.removeKeyById(keyStore.id);
    return delKey;
};
const logoutByUserId = async (userId) => {
    return await KeyTokenService.deleteKeyById(userId);
};
const login = async (reqBody) => {
    try {
        // check user existence
        const checkUser = await prisma.user.findUnique({
            where: { email: reqBody.email, isDestroyed: false },
            include: { avatar: { select: { fileUrl: true } } },
        });
        if (!checkUser) {
            throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
        }
        if (!checkUser.isVerified) {
            throw new ApiError(StatusCodes.FORBIDDEN, "Your account is not verified yet! Please verify your email first.");
        }
        // check password match
        const matchedPassword = await bcrypt.compare(reqBody.password, checkUser.password);
        if (!matchedPassword)
            throw new ApiError(StatusCodes.UNAUTHORIZED, "Password not match!");
        // create public key and private to generate jwt tokens
        const publicKey = crypto.randomBytes(64).toString("hex");
        const privateKey = crypto.randomBytes(64).toString("hex");
        // create kid
        const kid = uuidV4();
        // generate access and refreshToken based on public and private key
        const tokens = (await authUtils.createTokenPair({
            id: checkUser.id,
            email: checkUser.email,
            role: checkUser.role,
            kid,
        }, publicKey, privateKey));
        // create key token data
        await KeyTokenService.createKeyToken({
            userId: checkUser.id,
            refreshToken: tokens.refreshToken,
            publicKey,
            privateKey,
            kid,
        });
        // return data
        return {
            ...pickUserWithAvatar(checkUser),
            refreshToken: tokens.refreshToken,
            accessToken: tokens.accessToken,
            kid,
        };
    }
    catch (error) {
        throw error;
    }
};
const getGoogleAuthUrl = async (state) => {
    const googleClient = authUtils.getGoogleClient();
    return googleClient.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: ["openid", "email", "profile"],
        state,
    });
};
const handleGoogleCallback = async (code) => {
    try {
        const googleClient = authUtils.getGoogleClient();
        const { tokens } = await googleClient.getToken(code);
        if (!tokens.id_token) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "No google id_token present!");
        }
        const googleTicket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: env.GOOGLE_CLIENT_ID,
        });
        const payload = googleTicket.getPayload();
        const email = payload?.email;
        const emailVerified = payload?.email_verified;
        if (!email || !emailVerified) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Google email account is not verified!");
        }
        let user = await findByEmail({ email });
        if (!user) {
            const randomPassword = crypto.randomBytes(16).toString("hex");
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            user = await createUserDocument({
                email,
                firstName: payload?.given_name,
                lastName: payload?.family_name,
                password: hashedPassword,
                role: "student",
                isVerified: true,
            });
        }
        else if (!user.isVerified) {
            user = await updateUserDocument(user.id, { isVerified: true });
        }
        const publicKey = crypto.randomBytes(64).toString("hex");
        const privateKey = crypto.randomBytes(64).toString("hex");
        const kid = uuidV4();
        const tokensPair = (await authUtils.createTokenPair({
            id: user.id,
            email: user.email,
            role: user.role,
            kid,
        }, publicKey, privateKey));
        await KeyTokenService.createKeyToken({
            userId: user.id,
            refreshToken: tokensPair.refreshToken,
            publicKey,
            privateKey,
            kid,
        });
        return {
            ...pickUser(user),
            refreshToken: tokensPair.refreshToken,
            accessToken: tokensPair.accessToken,
            kid,
        };
    }
    catch (error) {
        throw error;
    }
};
const getMe = async (userId) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId, isDestroyed: false },
            include: { avatar: { select: { fileUrl: true } } },
        });
        if (!user)
            throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
        return pickUserWithAvatar(user);
    }
    catch (error) {
        throw error;
    }
};
const facebookAuthHandler = async (accessToken) => {
    try {
        // handle get response from facebook
        let response = await axios.get(`https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email`);
        const { id, email, name } = response.data;
        if (!id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Authentication failed! Please try again later!");
        }
        if (!email) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Facebook account does not provide email. Please use another login method.");
        }
        // check account existence
        let checkUser = await prisma.user.findUnique({
            where: { email, isDestroyed: false },
        });
        if (!checkUser) {
            // create password
            const randomPassword = crypto.randomBytes(16).toString("hex");
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            // format first name and last name
            const parts = String(name || "")
                .trim()
                .split(/\s+/)
                .filter(Boolean);
            const firstName = parts[0] || "Facebook";
            const lastName = parts.slice(1).join(" ") || firstName;
            // create new user
            checkUser = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName,
                    role: "student",
                    isVerified: true,
                },
            });
        }
        else if (!checkUser.isVerified) {
            checkUser = await prisma.user.update({
                where: { id: checkUser.id },
                data: { isVerified: true },
            });
        }
        const session = await issueAuthSession(checkUser);
        return {
            ...pickUser(checkUser),
            ...session,
        };
    }
    catch (error) {
        throw error;
    }
};
const updateProfile = async (userId, reqBody, userAvatar = null) => {
    try {
        const existingUser = await prisma.user.findUnique({
            where: { id: userId, isDestroyed: false },
        });
        if (!existingUser)
            throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
        if (!existingUser.isVerified) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, "Your account is not active yet!");
        }
        let updateUser = existingUser;
        if (userAvatar) {
            return await prisma.$transaction(async (tx) => {
                const createdResource = await resourceService.createResourceWithTransaction({
                    publicId: userAvatar.publicId,
                    fileSize: userAvatar.fileSize ?? null,
                    fileType: userAvatar.fileType ?? null,
                    fileUrl: userAvatar.fileUrl,
                }, tx);
                if (existingUser.avatarId) {
                    await resourceService.deleteResourceWithTransaction(existingUser.avatarId, tx);
                }
                const updatedUser = await tx.user.update({
                    where: { id: userId },
                    data: {
                        avatarId: createdResource.id,
                    },
                });
                return pickUser(updatedUser);
            });
        }
        else if (reqBody.email) {
        }
        else {
            let hashedPassword = null;
            if (reqBody.currentPassword && reqBody.newPassword) {
                const isMatchedPassword = await bcrypt.compare(reqBody.currentPassword, existingUser.password);
                if (!isMatchedPassword)
                    throw new ApiError(StatusCodes.UNAUTHORIZED, "Password not match!");
                hashedPassword = await bcrypt.hash(reqBody.newPassword, 10);
            }
            updateUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    firstName: reqBody.firstName ?? existingUser.firstName,
                    lastName: reqBody.lastName ?? existingUser.lastName,
                    dateOfBirth: reqBody.dateOfBirth ?? existingUser.dateOfBirth,
                    phoneNumber: reqBody.phoneNumber ?? existingUser.phoneNumber,
                    password: hashedPassword ?? existingUser.password,
                },
            });
        }
        return pickUser(updateUser);
    }
    catch (error) {
        throw error;
    }
};
const registerLecturerProfile = async (userId, reqBody) => {
    try {
        const existingUser = await prisma.user.findUnique({
            where: { id: userId, isDestroyed: false },
        });
        if (!existingUser)
            throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
        const existingLecturerProfile = await prisma.lecturerProfile.findFirst({
            where: { lecturerId: userId, isDestroyed: false },
            select: { id: true },
        });
        if (existingLecturerProfile)
            throw new ApiError(StatusCodes.CONFLICT, "Lecturer profile already registered!");
        const beginStudiesDate = new Date(reqBody.beginStudies);
        const dateOfBirthDate = new Date(reqBody.dateOfBirth);
        if (Number.isNaN(beginStudiesDate.getTime())) {
            throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, "beginStudies must be a valid javascript timestamp.");
        }
        if (Number.isNaN(dateOfBirthDate.getTime())) {
            throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, "dateOfBirth must be a valid javascript timestamp.");
        }
        return await prisma.$transaction(async (tx) => {
            const createdResource = await resourceService.createResourceWithTransaction({
                publicId: reqBody.lecturerFile.publicId,
                fileSize: reqBody.lecturerFile.fileSize ?? null,
                fileType: reqBody.lecturerFile.fileType ?? null,
                fileUrl: reqBody.lecturerFile.fileUrl,
            }, tx);
            await tx.user.update({
                where: { id: userId },
                data: {
                    firstName: reqBody.firstName,
                    lastName: reqBody.lastName,
                    dateOfBirth: dateOfBirthDate,
                    phoneNumber: reqBody.phoneNumber,
                },
            });
            const newLecturerProfile = await tx.lecturerProfile.create({
                data: {
                    lecturerId: userId,
                    lecturerFileId: createdResource.id,
                    gender: reqBody.gender,
                    nationality: reqBody.nationality,
                    professionalTitle: reqBody.professionalTitle,
                    beginStudies: beginStudiesDate,
                    highestDegree: reqBody.highestDegree,
                    bio: reqBody.bio,
                },
                include: {
                    lecturer: true,
                },
            });
            return newLecturerProfile;
        });
    }
    catch (error) {
        throw error;
    }
};
const getPublicLecturers = async ({ page, itemsPerPage, q, }) => {
    try {
        const currentPage = page || DEFAULT_PAGE;
        const perPage = itemsPerPage || DEFAULT_ITEMS_PER_PAGE;
        const skip = (currentPage - 1) * perPage;
        const query = (q || "").trim();
        const whereCondition = {
            isDestroyed: false,
            role: "lecturer",
            lecturerProfile: {
                is: {
                    isDestroyed: false,
                    isActive: true,
                },
            },
        };
        if (query) {
            whereCondition.OR = [
                { firstName: { contains: query } },
                { lastName: { contains: query } },
                { email: { contains: query } },
                {
                    lecturerProfile: {
                        is: {
                            professionalTitle: { contains: query },
                        },
                    },
                },
            ];
        }
        const [lecturers, total] = await Promise.all([
            prisma.user.findMany({
                where: whereCondition,
                include: {
                    avatar: { select: { fileUrl: true } },
                    lecturerProfile: {
                        select: {
                            professionalTitle: true,
                            nationality: true,
                            bio: true,
                            totalStudents: true,
                            totalCourses: true,
                            avgRating: true,
                        },
                    },
                },
                skip,
                take: perPage,
                orderBy: { createdAt: "desc" },
            }),
            prisma.user.count({ where: whereCondition }),
        ]);
        return {
            lecturers,
            totalLecturers: total,
            pagination: {
                page: currentPage,
                itemsPerPage: perPage,
                total,
                totalPages: Math.ceil(total / perPage),
            },
        };
    }
    catch (error) {
        throw error;
    }
};
const getPublicLecturerDetail = async (lecturerId) => {
    try {
        const lecturer = await prisma.user.findUnique({
            where: {
                id: lecturerId,
                isDestroyed: false,
                role: "lecturer",
            },
            include: {
                avatar: { select: { fileUrl: true } },
                lecturerProfile: {
                    where: {
                        isDestroyed: false,
                        isActive: true,
                    },
                    include: {
                        lecturerFile: {
                            select: {
                                fileUrl: true,
                                fileType: true,
                            },
                        },
                    },
                },
                courses: {
                    where: {
                        isDestroyed: false,
                        status: "published",
                    },
                    include: {
                        thumbnail: {
                            select: {
                                fileUrl: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 8,
                },
            },
        });
        if (!lecturer || !lecturer.lecturerProfile) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Lecturer not found!");
        }
        return lecturer;
    }
    catch (error) {
        throw error;
    }
};
const forgotPassword = async (email) => {
    try {
        // check user existence
        const user = await prisma.user.findFirst({
            where: { email, isDestroyed: false },
        });
        if (!user) {
            throw new ApiError(StatusCodes.OK, "If an account with this email exists, we will send you a reset link!");
        }
        // generate token for reset password
        const rawToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto
            .createHash("sha256")
            .update(rawToken)
            .digest("hex");
        // update user model
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: tokenHash,
                resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
            },
        });
        // send reset password email
        const resetPasswordLink = `${WEBSITE_DOMAINS}/auth/forgot-password?token=${rawToken}`;
        const customSubject = "ADMIN EduLearn: Reset Password!";
        const htmlContent = `
  <h3>This is reset password link:</h3>
  <h3>${resetPasswordLink}</h3>
  <h3>Sincerely,<br/>- ADMIN EduLearn -</h3>
`;
        await BrevoProvider.sendEmail({
            recipientEmail: user.email,
            subject: customSubject,
            htmlContent,
        });
        return {
            message: "If an account with this email exists, we will send you a reset link!",
            ...pickUser(updatedUser),
        };
    }
    catch (error) {
        throw error;
    }
};
const resetPassword = async ({ token, newPassword, }) => {
    try {
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
        // check user existence
        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: tokenHash,
                isDestroyed: false,
            },
        });
        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
        }
        // check token expiration
        if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
            throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Token expired! Please request a new one.");
        }
        // hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // update user model
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            },
        });
        return {
            message: "Password reset successfully!",
            ...pickUser(updatedUser),
        };
    }
    catch (error) {
        throw error;
    }
};
const findByEmail = async ({ email }) => {
    return await prisma.user.findFirst({
        where: { email, isDestroyed: false },
    });
};
const createUserDocument = async (data) => {
    return await prisma.user.create({
        data,
    });
};
const updateUserDocument = async (id, data) => {
    return await prisma.user.update({
        where: { id },
        data,
    });
};
export const userService = {
    register,
    verifyAccount,
    login,
    logout,
    logoutByUserId,
    getGoogleAuthUrl,
    handleGoogleCallback,
    getMe,
    handleRefreshToken,
    findByEmail,
    updateProfile,
    registerLecturerProfile,
    getPublicLecturers,
    getPublicLecturerDetail,
    forgotPassword,
    resetPassword,
    createUserDocument,
    updateUserDocument,
    facebookAuthHandler,
};
//# sourceMappingURL=userService.js.map