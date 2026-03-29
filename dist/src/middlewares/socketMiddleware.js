import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { authUtils } from "@/utils/auth.js";
import { pickUser } from "@/utils/helpers.js";
import { StatusCodes } from "http-status-codes";
const parseCookieToken = (cookieHeader) => {
    if (!cookieHeader)
        return null;
    const cookies = cookieHeader.split(";").map((item) => item.trim());
    const found = cookies.find((item) => item.startsWith("accessToken="));
    if (!found)
        return null;
    return decodeURIComponent(found.replace("accessToken=", ""));
};
export const socketAuthMiddleware = async (socket, next) => {
    const fromAuth = socket.handshake.auth?.token;
    const fromCookie = parseCookieToken(socket.handshake.headers.cookie);
    const accessToken = fromAuth || fromCookie;
    if (!accessToken) {
        next(new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized!"));
        return;
    }
    try {
        const decoded = authUtils.decodeToken(accessToken);
        if (!decoded || typeof decoded === "string" || !decoded.kid) {
            next(new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized!"));
            return;
        }
        const keyToken = await prisma.keyToken.findFirst({
            where: { kid: decoded.kid, isDestroyed: false },
        });
        if (!keyToken) {
            next(new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized!"));
            return;
        }
        const jwtDecoded = await authUtils.verifyToken(accessToken, keyToken.publicKey);
        const userId = jwtDecoded?.id;
        const user = await prisma.user.findUnique({
            where: { id: userId, isDestroyed: false },
        });
        if (!user) {
            next(new ApiError(StatusCodes.BAD_REQUEST, "User not found!"));
            return;
        }
        socket.user = pickUser(user);
        next();
    }
    catch {
        next(new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized!"));
    }
};
//# sourceMappingURL=socketMiddleware.js.map