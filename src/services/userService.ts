import { prisma } from "@/lib/prisma.js";
import { KeyStore } from "@/types/keyStore.type.js";
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
};
