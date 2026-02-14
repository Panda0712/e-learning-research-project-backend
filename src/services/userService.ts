import { env } from "@/configs/environment.js";
import { prisma } from "@/lib/prisma.js";
import { BrevoProvider } from "@/providers/BrevoProvider.js";
import { KeyStore } from "@/types/keyStore.type.js";
import { RegisterLecturer } from "@/types/registerLecturer.type.js";
import { UpdateProfile } from "@/types/updateProfile.type.js";
import { User } from "@/types/user.type.js";
import ApiError from "@/utils/ApiError.js";
import { authUtils } from "@/utils/auth.js";
import { WEBSITE_DOMAINS } from "@/utils/constants.js";
import { pickUser } from "@/utils/helpers.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidV4 } from "uuid";
import KeyTokenService from "./keyTokenService.js";
import { resourceService } from "./resourceService.js";

const handleRefreshToken = async ({
  refreshToken,
  user,
  keyStore,
}: {
  refreshToken: string;
  user: User;
  keyStore: KeyStore;
}) => {
  try {
    const { id, email, role } = user;

    // check refreshTokenUsed array
    if (keyStore.refreshTokenUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById(id);
      throw new ApiError(StatusCodes.FORBIDDEN, "Something wrong happened!");
    }

    // check refreshToken
    if (keyStore.refreshToken !== refreshToken) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "User not registered!");
    }

    // check user
    const foundUser = await findByEmail({ email });
    if (!foundUser)
      throw new ApiError(StatusCodes.UNAUTHORIZED, "User not registered!");

    // create new tokens
    const tokens = (await authUtils.createTokenPair(
      {
        id,
        email,
        role,
        kid: keyStore.kid,
      },
      keyStore.publicKey,
      keyStore.privateKey,
    )) as { accessToken: string; refreshToken: string };

    // update key token table
    await prisma.keyToken.update({
      where: { id: keyStore.id },
      data: {
        refreshToken: tokens.refreshToken,
        refreshTokenUsed: {
          set: [...keyStore.refreshTokenUsed, refreshToken].filter(
            (v, i, arr) => arr.indexOf(v) === i,
          ),
        },
      },
    });

    return {
      user: { id, email, role, kid: keyStore.kid },
      tokens,
    };
  } catch (error: any) {
    throw new Error(error);
  }
};

const register = async (reqBody: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) => {
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
        throw new ApiError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          "Cannot get new user data! Please try again later!",
        );
      }

      // send verification email to user
      const verificationLink = `${WEBSITE_DOMAINS}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`;
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
  } catch (error: any) {
    throw new Error(error);
  }
};

const verifyAccount = async (reqBody: { email: string; token: string }) => {
  try {
    // check user existence
    const existingUser = await prisma.user.findUnique({
      where: { email: reqBody.email, isDestroyed: false },
    });
    if (!existingUser)
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
    if (existingUser.isVerified)
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        "Your account is already activated!",
      );
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
  } catch (error: any) {
    throw new Error(error);
  }
};

const logout = async ({ keyStore }: { keyStore: KeyStore }) => {
  const delKey = await KeyTokenService.removeKeyById(keyStore.id);

  return delKey;
};

const login = async (reqBody: { email: string; password: string }) => {
  try {
    // check user existence
    const checkUser = await prisma.user.findUnique({
      where: { email: reqBody.email, isDestroyed: false },
    });
    if (!checkUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
    }

    // check password match
    const matchedPassword = await bcrypt.compare(
      reqBody.password,
      checkUser.password,
    );
    if (!matchedPassword)
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Password not match!");

    // create public key and private to generate jwt tokens
    const publicKey = crypto.randomBytes(64).toString("hex");
    const privateKey = crypto.randomBytes(64).toString("hex");

    // create kid
    const kid = uuidV4();

    // generate access and refreshToken based on public and private key
    const tokens = (await authUtils.createTokenPair(
      {
        id: checkUser.id,
        email: checkUser.email,
        role: checkUser.role,
        kid,
      },
      publicKey,
      privateKey,
    )) as { refreshToken: string; accessToken: string };

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
      ...pickUser(checkUser),
      refreshToken: tokens.refreshToken,
      accessToken: tokens.accessToken,
      kid,
    };
  } catch (error: any) {
    throw new Error(error);
  }
};

const getGoogleAuthUrl = async () => {
  const googleClient = authUtils.getGoogleClient();

  return googleClient.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["openid", "email", "profile"],
  });
};

const handleGoogleCallback = async (code: string) => {
  try {
    const googleClient = authUtils.getGoogleClient();

    const { tokens } = await googleClient.getToken(code);

    if (!tokens.id_token) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "No google id_token present!",
      );
    }

    const googleTicket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.GOOGLE_CLIENT_ID as string,
    });

    const payload = googleTicket.getPayload();

    const email = payload?.email;
    const emailVerified = payload?.email_verified;

    if (!email || !emailVerified) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Google email account is not verified!",
      );
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
    } else if (!user.isVerified) {
      user = await updateUserDocument(user.id, { isVerified: true });
    }

    const publicKey = crypto.randomBytes(64).toString("hex");
    const privateKey = crypto.randomBytes(64).toString("hex");

    const kid = uuidV4();

    const tokensPair = (await authUtils.createTokenPair(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        kid,
      },
      publicKey,
      privateKey,
    )) as { refreshToken: string; accessToken: string };

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
  } catch (error: any) {
    throw new Error(error);
  }
};

const updateProfile = async (
  userId: number,
  reqBody: UpdateProfile,
  userAvatar: {
    publicId: string;
    fileUrl: string;
    fileSize?: number;
    fileType?: string;
  } | null = null,
) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId, isDestroyed: false },
    });
    if (!existingUser)
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
    if (!existingUser.isVerified) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Your account is not active yet!",
      );
    }

    let updateUser = existingUser;

    if (userAvatar) {
      return await prisma.$transaction(async (tx) => {
        const createdResource =
          await resourceService.createResourceWithTransaction(
            {
              publicId: userAvatar.publicId,
              fileSize: userAvatar.fileSize ?? null,
              fileType: userAvatar.fileType ?? null,
              fileUrl: userAvatar.fileUrl,
            },
            tx,
          );

        if (existingUser.avatarId) {
          await resourceService.deleteResourceWithTransaction(
            existingUser.avatarId,
            tx,
          );
        }

        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            avatarId: createdResource.id,
          },
        });

        return pickUser(updatedUser);
      });
    } else if (reqBody.email) {
    } else {
      let hashedPassword = null;
      if (reqBody.currentPassword && reqBody.newPassword) {
        const isMatchedPassword = await bcrypt.compare(
          reqBody.currentPassword,
          existingUser.password,
        );
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
  } catch (error: any) {
    throw new Error(error);
  }
};

const registerLecturerProfile = async (
  userId: number,
  reqBody: RegisterLecturer,
) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId, isDestroyed: false },
    });
    if (!existingUser)
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");

    return await prisma.$transaction(async (tx) => {
      const createdResource =
        await resourceService.createResourceWithTransaction(
          {
            publicId: reqBody.lecturerFile.publicId,
            fileSize: reqBody.lecturerFile.fileSize ?? null,
            fileType: reqBody.lecturerFile.fileType ?? null,
            fileUrl: reqBody.lecturerFile.fileUrl,
          },
          tx,
        );

      const newLecturerProfile = await tx.lecturerProfile.create({
        data: {
          lecturerId: userId,
          lecturerFileId: createdResource.id,
          gender: reqBody.gender,
          nationality: reqBody.nationality,
          professionalTitle: reqBody.professionalTitle,
          beginStudies: reqBody.beginStudies,
          highestDegree: reqBody.highestDegree,
          bio: reqBody.bio,
        },
        include: {
          lecturer: true,
        },
      });

      return newLecturerProfile;
    });
  } catch (error: any) {
    throw new Error(error);
  }
};

const forgotPassword = async (email: string) => {
  try {
    // check user existence
    const user = await prisma.user.findFirst({
      where: { email, isDestroyed: false },
    });
    if (!user) {
      throw new ApiError(
        StatusCodes.OK,
        "If an account with this email exists, we will send you a reset link!",
      );
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
    const resetPasswordLink = `${WEBSITE_DOMAINS}/reset-password?token=${tokenHash}`;
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
      message:
        "If an account with this email exists, we will send you a reset link!",
      ...pickUser(updatedUser),
    };
  } catch (error: any) {
    throw new Error(error);
  }
};

const resetPassword = async ({
  token,
  newPassword,
}: {
  token: string;
  newPassword: string;
}) => {
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
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        "Token expired! Please request a new one.",
      );
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
  } catch (error: any) {
    throw new Error(error);
  }
};

const findByEmail = async ({ email }: { email: string }) => {
  return await prisma.user.findFirst({
    where: { email, isDestroyed: false },
  });
};

const createUserDocument = async (data: any) => {
  return await prisma.user.create({
    data,
  });
};

const updateUserDocument = async (id: number, data: any) => {
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
  getGoogleAuthUrl,
  handleGoogleCallback,
  handleRefreshToken,
  findByEmail,
  updateProfile,
  registerLecturerProfile,
  forgotPassword,
  resetPassword,
  createUserDocument,
  updateUserDocument,
};
