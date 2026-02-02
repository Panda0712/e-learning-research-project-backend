import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { authUtils } from "@/utils/auth.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

declare global {
  namespace Express {
    interface Request {
      jwtDecoded?: any;
    }
  }
}

const isAuthorized = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const clientAccessToken = req.cookies?.accessToken;
  const clientRefreshToken = req.cookies?.refreshToken;

  if (!clientAccessToken || !clientRefreshToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized!"));
    return;
  }

  try {
    // check key token data
    const keyToken = await prisma.keyToken.findFirst({
      where: { refreshToken: clientRefreshToken },
    });
    if (!keyToken) {
      next(new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized!"));
      return;
    }

    // check refresh token is included in the refreshTokenUsed array
    const refreshTokenUsed =
      typeof keyToken.refreshTokenUsed === "string"
        ? JSON.parse(keyToken.refreshTokenUsed)
        : [];
    if (refreshTokenUsed.includes(clientRefreshToken)) {
      next(new ApiError(StatusCodes.FORBIDDEN, "Something wrong happened!"));
      return;
    }

    // decode accessToken
    const accessTokenDecoded = await authUtils.verifyToken(
      clientAccessToken,
      keyToken.publicKey,
    );

    req.jwtDecoded = accessTokenDecoded;

    next();
  } catch (error: any) {
    if (error?.message?.includes("jwt expired")) {
      next(new ApiError(StatusCodes.GONE, "Need to refresh token!"));
      return;
    }

    next(new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized!"));
  }
};

export const authMiddleware = {
  isAuthorized,
};
