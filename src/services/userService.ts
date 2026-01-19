import { prisma } from "@/lib/prisma.js";
import { KeyStore } from "@/types/keyStore.type.js";
import { RegisterLecturer } from "@/types/registerLecturer.type.js";
import { UpdateProfile } from "@/types/updateProfile.type.js";
import { User } from "@/types/user.type.js";
import ApiError from "@/utils/ApiError.js";
import { authUtils } from "@/utils/auth.js";
import { pickUser } from "@/utils/formatters.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { StatusCodes } from "http-status-codes";
import KeyTokenService from "./keyTokenService.js";

const handleRefreshToken = async ({
  refreshToken,
  user,
  keyStore,
}: {
  refreshToken: string;
  user: User;
  keyStore: KeyStore;
}) => {
  const { id, email } = user;

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
    user: { id, email },
    tokens,
  };
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
      where: { email: reqBody.email },
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
      },
    });

    if (newUser) {
      // get created user
      const getNewUser = await prisma.user.findUnique({
        where: { id: newUser.id },
      });
      if (!getNewUser) {
        throw new ApiError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          "Cannot get new user data! Please try again later!",
        );
      }

      // send verification email to user

      // return data
      return pickUser(getNewUser);
    }
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
      where: { email: reqBody.email },
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

    // generate access and refreshToken based on public and private key
    const tokens = (await authUtils.createTokenPair(
      {
        id: checkUser.id,
        email: checkUser.email,
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
    });

    // return data
    return {
      ...pickUser(checkUser),
      refreshToken: tokens.refreshToken,
      accessToken: tokens.accessToken,
    };
  } catch (error: any) {
    throw new Error(error);
  }
};

const updateProfile = async (
  userId: number,
  reqBody: UpdateProfile,
  userAvatar = null,
) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
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
      where: { id: userId },
    });
    if (!existingUser)
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");

    return await prisma.lecturerProfile.create({
      data: {
        lecturerId: userId,
        resourceId: reqBody.resourceId,
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
  } catch (error: any) {
    throw new Error(error);
  }
};

const findByEmail = async ({ email }: { email: string }) => {
  return await prisma.user.findFirst({
    where: { email },
  });
};

export const userService = {
  register,
  login,
  logout,
  handleRefreshToken,
  findByEmail,
  updateProfile,
  registerLecturerProfile,
};
