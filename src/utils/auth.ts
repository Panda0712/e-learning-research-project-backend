import JWT from "jsonwebtoken";
import { authUtilsPayload } from "@/types/authUtilsPayload.type.js";

const createTokenPair = async (
  payload: authUtilsPayload,
  publicKey: string,
  privateKey: string,
) => {
  try {
    // create accessToken
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "2 days",
    });

    // create refreshToken
    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "7 days",
    });

    // try to verify the token
    JWT.verify(accessToken, publicKey, (error, decode) => {
      if (error) {
        console.error("Error verify::", error);
      } else {
        console.log("decode verify::", decode);
      }
    });

    return { accessToken, refreshToken };
  } catch (error) {
    return error;
  }
};

const verifyToken = async (token: string, keySecret: string) => {
  return JWT.verify(token, keySecret);
};

export const authUtils = { createTokenPair, verifyToken };
