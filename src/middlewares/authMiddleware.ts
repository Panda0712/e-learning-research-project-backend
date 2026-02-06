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
  const accessToken = req.cookies?.accessToken;

  if (!accessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized!"));
    return;
  }

  try {
    // decode token
    const decoded = authUtils.decodeToken(accessToken);

    if (!decoded) {
      next(new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized!"));
      return;
    }
    if (!decoded.kid) {
      next(new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized!"));
      return;
    }

    // check kid and look up key token model
    const keyToken = await prisma.keyToken.findFirst({
      where: { kid: decoded.kid, isDestroyed: false },
    });
    if (!keyToken) {
      next(new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized!"));
      return;
    }

    // verify accessToken
    const jwtDecoded = await authUtils.verifyToken(
      accessToken,
      keyToken?.publicKey,
    );

    req.jwtDecoded = jwtDecoded;

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
