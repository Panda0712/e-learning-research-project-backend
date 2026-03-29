import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { authUtils } from "@/utils/auth.js";
import { StatusCodes } from "http-status-codes";
const isAuthorized = async (req, res, next) => {
    const accessToken = req.cookies?.accessToken;
    if (!accessToken) {
        next(new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized!"));
        console.log("accessToken");
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
        const jwtDecoded = await authUtils.verifyToken(accessToken, keyToken?.publicKey);
        req.jwtDecoded = jwtDecoded;
        next();
    }
    catch (error) {
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
//# sourceMappingURL=authMiddleware.js.map