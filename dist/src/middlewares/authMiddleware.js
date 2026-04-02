import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { authUtils } from "@/utils/auth.js";
import { StatusCodes } from "http-status-codes";
const isAuthorized = async (req, res, next) => {
    const accessToken = extractAccessToken(req);
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
const optionalAuthorized = async (req, res, next) => {
    const accessToken = extractAccessToken(req);
    if (!accessToken) {
        next();
        return;
    }
    try {
        const decoded = authUtils.decodeToken(accessToken);
        if (!decoded?.kid) {
            next();
            return;
        }
        const keyToken = await prisma.keyToken.findFirst({
            where: { kid: decoded.kid, isDestroyed: false },
        });
        if (!keyToken) {
            next();
            return;
        }
        const jwtDecoded = await authUtils.verifyToken(accessToken, keyToken.publicKey);
        req.jwtDecoded = jwtDecoded;
        next();
    }
    catch {
        // For optional auth, fail-open and continue as anonymous request.
        next();
    }
};
const extractAccessToken = (req) => {
    const cookieToken = req.cookies?.accessToken;
    if (cookieToken)
        return cookieToken;
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (typeof authHeader === "string") {
        const match = authHeader.match(/^Bearer\s+(.+)$/i);
        if (match?.[1]) {
            return match[1].trim();
        }
    }
    return undefined;
};
export const authMiddleware = {
    isAuthorized,
    optionalAuthorized,
};
//# sourceMappingURL=authMiddleware.js.map