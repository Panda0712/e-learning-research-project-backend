import { env } from "@/configs/environment.js";
import { CloudinaryProvider } from "@/providers/CloudinaryProvider.js";
import { userService } from "@/services/userService.js";
import ApiError from "@/utils/ApiError.js";
import { FE_OAUTH_CALLBACK } from "@/utils/constants.js";
import crypto from "crypto";
import { StatusCodes } from "http-status-codes";
import ms from "ms";
const isProd = env.BUILD_MODE === "production";
const authCookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: ms("14 days"),
};
const oauthTempCookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: ms("10 minutes"),
};
const normalizeRedirect = (raw) => {
    if (!raw)
        return FE_OAUTH_CALLBACK;
    try {
        const url = new URL(raw);
        if (url.origin !== FE_OAUTH_CALLBACK)
            return FE_OAUTH_CALLBACK;
        return url.toString();
    }
    catch {
        return FE_OAUTH_CALLBACK;
    }
};
const register = async (req, res, next) => {
    try {
        const createdUser = await userService.register(req.body);
        res.status(StatusCodes.CREATED).json(createdUser);
    }
    catch (error) {
        next(error);
    }
};
const login = async (req, res, next) => {
    try {
        const result = await userService.login(req.body);
        res.cookie("accessToken", result.accessToken, authCookieOptions);
        res.cookie("refreshToken", result.refreshToken, authCookieOptions);
        const { accessToken, refreshToken, kid, ...safeUser } = result;
        res.status(StatusCodes.OK).json(safeUser);
    }
    catch (error) {
        next(error);
    }
};
const verifyAccount = async (req, res, next) => {
    try {
        const result = await userService.verifyAccount(req.body);
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
const logout = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded?.id;
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        await userService.logoutByUserId(userId);
        res.status(StatusCodes.OK).json({
            loggedOut: true,
        });
    }
    catch (error) {
        next(error);
    }
};
const handleRefreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
        if (!refreshToken) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, "Refresh token is required!");
        }
        const result = await userService.handleRefreshToken({ refreshToken });
        res.cookie("accessToken", result.tokens.accessToken, authCookieOptions);
        res.cookie("refreshToken", result.tokens.refreshToken, authCookieOptions);
        res.status(StatusCodes.OK).json({
            message: "Token refreshed successfully!",
            user: result.user,
        });
    }
    catch (error) {
        next(error);
    }
};
const updateProfile = async (req, res, next) => {
    try {
        const { userId } = req.jwtDecoded.id;
        const userAvatar = req.body?.avatar;
        const result = await userService.updateProfile(Number(userId), req.body, userAvatar);
        res.status(StatusCodes.OK).json({
            message: "Updated profile successfully!",
            ...result,
        });
    }
    catch (error) {
        next(error);
    }
};
const registerLecturerProfile = async (req, res, next) => {
    try {
        const userId = Number(req.jwtDecoded?.id);
        if (!userId)
            throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized!");
        const result = await userService.registerLecturerProfile(userId, req.body);
        res.status(StatusCodes.OK).json({
            message: "Submitted lecturer profile successfully!",
            ...result,
        });
    }
    catch (error) {
        next(error);
    }
};
const getPublicLecturers = async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const itemsPerPage = Number(req.query.itemsPerPage) || 8;
        const q = String(req.query.q || "");
        const result = await userService.getPublicLecturers({
            page,
            itemsPerPage,
            q,
        });
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
const getPublicLecturerDetail = async (req, res, next) => {
    try {
        const lecturerId = Number(req.params.id);
        const result = await userService.getPublicLecturerDetail(lecturerId);
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const result = await userService.forgotPassword(email);
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        const result = await userService.resetPassword({ token, newPassword });
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
const uploadAvatar = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded.id;
        const file = req.file;
        if (!file)
            next(new ApiError(StatusCodes.BAD_REQUEST, "No file uploaded!"));
        const uploadedAvatar = await CloudinaryProvider.uploadImage(file.buffer);
        const result = await userService.updateProfile(userId, {}, {
            publicId: uploadedAvatar.public_id,
            fileUrl: uploadedAvatar.secure_url,
            fileSize: file.size,
            fileType: file.mimetype,
        });
        res.status(StatusCodes.OK).json({
            message: "Avatar uploaded successfully!",
            ...result,
        });
    }
    catch (error) {
        next(error);
    }
};
const uploadLecturerFile = async (req, res, next) => {
    try {
        const file = req.file;
        const uploadedFile = await CloudinaryProvider.uploadDoc(file.buffer);
        res.status(StatusCodes.OK).json(uploadedFile);
    }
    catch (error) {
        next(error);
    }
};
const googleAuthStartHandler = async (req, res, next) => {
    try {
        const frontendRedirect = normalizeRedirect(req.query?.redirect);
        const state = crypto.randomBytes(24).toString("hex");
        res.cookie("google_oauth_state", state, oauthTempCookieOptions);
        res.cookie("google_oauth_redirect", frontendRedirect, oauthTempCookieOptions);
        const googleUrl = await userService.getGoogleAuthUrl(state);
        return res.redirect(googleUrl);
    }
    catch (error) {
        next(error);
    }
};
const googleAuthCallbackHandler = async (req, res, next) => {
    const code = req.query.code;
    const state = req.query.state;
    const cookieState = req.cookies?.google_oauth_state;
    const frontendRedirect = normalizeRedirect(req.cookies?.google_oauth_redirect);
    if (!code || !state || !cookieState || state !== cookieState) {
        return res.redirect(`${frontendRedirect}?oauth=failed`);
    }
    try {
        const result = await userService.handleGoogleCallback(code);
        res.cookie("accessToken", result.accessToken, authCookieOptions);
        res.cookie("refreshToken", result.refreshToken, authCookieOptions);
        res.clearCookie("google_oauth_state");
        res.clearCookie("google_oauth_redirect");
        return res.redirect(`${frontendRedirect}?oauth=success`);
    }
    catch (error) {
        next(error);
    }
};
const getMe = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded.id;
        if (!userId)
            throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized!");
        const user = await userService.getMe(userId);
        return res.status(StatusCodes.OK).json(user);
    }
    catch (error) {
        next(error);
    }
};
const facebookAuthHandler = async (req, res, next) => {
    const { accessToken } = req.body;
    if (!accessToken) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Access token is required!");
    }
    try {
        const result = await userService.facebookAuthHandler(accessToken);
        res.cookie("accessToken", result.accessToken, authCookieOptions);
        res.cookie("refreshToken", result.refreshToken, authCookieOptions);
        const { accessToken: accessTokenPayload, refreshToken, kid, ...safeUser } = result;
        res.status(StatusCodes.OK).json(safeUser);
    }
    catch (error) {
        next(error);
    }
};
export const userController = {
    register,
    verifyAccount,
    login,
    logout,
    handleRefreshToken,
    updateProfile,
    registerLecturerProfile,
    getPublicLecturers,
    getPublicLecturerDetail,
    forgotPassword,
    resetPassword,
    uploadAvatar,
    uploadLecturerFile,
    googleAuthStartHandler,
    googleAuthCallbackHandler,
    getMe,
    facebookAuthHandler,
};
//# sourceMappingURL=userController.js.map