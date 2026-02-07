import JWT from "jsonwebtoken";
import { authUtilsPayload } from "@/types/authUtilsPayload.type.js";
import { env } from "@/configs/environment.js";
import { OAuth2Client } from "google-auth-library";

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

const decodeToken = (token: string) => {
  const decoded = JWT.decode(token, { complete: true });

  if (!decoded || typeof decoded !== "object") {
    throw new Error("Token is not valid!");
  }
  if (!decoded.header?.kid) {
    throw new Error("Token missing kid!");
  }

  return decoded.header;
};

const getGoogleClient = () => {
  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;
  const redirectUri = env.GOOGLE_REDIRECT_URL;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google client id and secret are both missing!");
  }

  return new OAuth2Client({
    clientId,
    clientSecret,
    redirectUri,
  });
};

export const authUtils = {
  createTokenPair,
  verifyToken,
  decodeToken,
  getGoogleClient,
};
