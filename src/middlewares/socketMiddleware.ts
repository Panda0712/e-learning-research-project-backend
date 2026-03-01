import { prisma } from "@/lib/prisma.js";
import { AuthenticatedSocket } from "@/types/socket.type.js";
import ApiError from "@/utils/ApiError.js";
import { authUtils } from "@/utils/auth.js";
import { pickUser } from "@/utils/helpers.js";
import { StatusCodes } from "http-status-codes";

type JwtDecoded = {
  id: number;
  email: string;
  role: string;
  kid: string;
};

export const socketAuthMiddleware = async (
  socket: AuthenticatedSocket,
  next: (err?: Error) => void,
) => {
  const accessToken = socket.handshake.auth?.token;

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

    const userId = (jwtDecoded as JwtDecoded)?.id;

    const user = await prisma.user.findUnique({
      where: { id: userId, isDestroyed: false },
    });

    if (!user) {
      next(new ApiError(StatusCodes.BAD_REQUEST, "User not found!"));
      return;
    }

    socket.user = pickUser(user)!;

    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized!"));
  }
};
