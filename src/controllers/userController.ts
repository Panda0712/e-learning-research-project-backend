import { env } from "@/configs/environment.js";
import { CloudinaryProvider } from "@/providers/CloudinaryProvider.js";
import { userService } from "@/services/userService.js";
import ApiError from "@/utils/ApiError.js";
import { FE_OAUTH_CALLBACK } from "@/utils/constants.js";
import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ms from "ms";

const isProd = env.BUILD_MODE === "production";

const authCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
  maxAge: ms("14 days"),
};

const oauthTempCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
  maxAge: ms("10 minutes"),
};

const normalizeRedirect = (raw?: string) => {
  if (!raw) return FE_OAUTH_CALLBACK;
  try {
    const url = new URL(raw);
    if (url.origin !== FE_OAUTH_CALLBACK) return FE_OAUTH_CALLBACK;
    return url.toString();
  } catch {
    return FE_OAUTH_CALLBACK;
  }
};

const ensureAdminRequest = (req: Request) => {
  const role = req.jwtDecoded?.role;
  if (role !== "admin") {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Forbidden: Admin access is required!",
    );
  }
};

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const createdUser = await userService.register(req.body);

    res.status(StatusCodes.CREATED).json(createdUser);
  } catch (error: any) {
    next(error);
  }
};

const submitContact = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const forwardedFor = req.headers["x-forwarded-for"];
    const ipFromHeader =
      typeof forwardedFor === "string"
        ? forwardedFor.split(",")[0]?.trim()
        : "";
    const ip = ipFromHeader || req.ip || req.socket.remoteAddress || "unknown";

    const result = await userService.submitContact(req.body, {
      ip,
      userAgent: req.headers["user-agent"] as string | null,
    });

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.login(req.body);

    res.cookie("accessToken", result.accessToken, authCookieOptions);
    res.cookie("refreshToken", result.refreshToken, authCookieOptions);

    const { accessToken, refreshToken, kid, ...safeUser } = result;

    res.status(StatusCodes.OK).json(safeUser);
  } catch (error: any) {
    next(error);
  }
};

const verifyAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await userService.verifyAccount(req.body);

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.jwtDecoded?.id;

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    await userService.logoutByUserId(userId);

    res.status(StatusCodes.OK).json({
      loggedOut: true,
    });
  } catch (error) {
    next(error);
  }
};

const handleRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Refresh token is required!",
      );
    }

    const result = await userService.handleRefreshToken({ refreshToken });

    res.cookie("accessToken", result.tokens.accessToken, authCookieOptions);
    res.cookie("refreshToken", result.tokens.refreshToken, authCookieOptions);

    res.status(StatusCodes.OK).json({
      message: "Token refreshed successfully!",
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.jwtDecoded?.id;

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized!");
    }

    const userAvatar = req.body?.avatar;

    const result = await userService.updateProfile(
      userId,
      req.body,
      userAvatar,
    );

    res.status(StatusCodes.OK).json({
      message: "Updated profile successfully!",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const registerLecturerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = Number(req.jwtDecoded?.id);
    if (!userId) throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized!");

    const result = await userService.registerLecturerProfile(userId, req.body);

    res.status(StatusCodes.OK).json({
      message: "Submitted lecturer profile successfully!",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const getPublicLecturers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
  } catch (error) {
    next(error);
  }
};

const getPublicLecturerDetail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const lecturerId = Number(req.params.id);
    const result = await userService.getPublicLecturerDetail(lecturerId);

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;

    const result = await userService.forgotPassword(email);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token, newPassword } = req.body;

    const result = await userService.resetPassword({ token, newPassword });
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const uploadAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.jwtDecoded.id;
    const file = req.file as Express.Multer.File;

    if (!file) next(new ApiError(StatusCodes.BAD_REQUEST, "No file uploaded!"));

    const uploadedAvatar = await CloudinaryProvider.uploadImage(file.buffer);

    const result = await userService.updateProfile(
      userId,
      {},
      {
        publicId: (uploadedAvatar as any).public_id,
        fileUrl: (uploadedAvatar as any).secure_url,
        fileSize: file.size,
        fileType: file.mimetype,
      },
    );

    res.status(StatusCodes.OK).json({
      message: "Avatar uploaded successfully!",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const uploadLecturerFile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const file = req.file as Express.Multer.File;

    const uploadedFile = await CloudinaryProvider.uploadDoc(file.buffer);

    res.status(StatusCodes.OK).json(uploadedFile);
  } catch (error) {
    next(error);
  }
};

const googleAuthStartHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const frontendRedirect = normalizeRedirect(
      req.query?.redirect as string | undefined,
    );
    const state = crypto.randomBytes(24).toString("hex");

    res.cookie("google_oauth_state", state, oauthTempCookieOptions);
    res.cookie(
      "google_oauth_redirect",
      frontendRedirect,
      oauthTempCookieOptions,
    );

    const googleUrl = await userService.getGoogleAuthUrl(state);

    return res.redirect(googleUrl);
  } catch (error) {
    next(error);
  }
};

const googleAuthCallbackHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const code = req.query.code as string | undefined;
  const state = req.query.state as string | undefined;

  const cookieState = req.cookies?.google_oauth_state as string | undefined;
  const frontendRedirect = normalizeRedirect(
    req.cookies?.google_oauth_redirect as string | undefined,
  );

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
  } catch (error) {
    next(error);
  }
};

const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.jwtDecoded.id;
    if (!userId) throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized!");

    const user = await userService.getMe(userId);
    return res.status(StatusCodes.OK).json(user);
  } catch (error) {
    next(error);
  }
};

const facebookAuthHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Access token is required!");
  }

  try {
    const result = await userService.facebookAuthHandler(accessToken);

    res.cookie("accessToken", result.accessToken, authCookieOptions);
    res.cookie("refreshToken", result.refreshToken, authCookieOptions);

    const {
      accessToken: accessTokenPayload,
      refreshToken,
      kid,
      ...safeUser
    } = result;

    res.status(StatusCodes.OK).json(safeUser);
  } catch (error) {
    next(error);
  }
};

const getAdminUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    ensureAdminRequest(req);
    const { page, itemsPerPage, role } = req.query;

    const queryPayload: {
      page?: number;
      itemsPerPage?: number;
      role?: string;
    } = {
      page: Number(page) || 1,
      itemsPerPage: Number(itemsPerPage) || 8,
    };

    if (typeof role === "string") {
      queryPayload.role = role;
    }

    const result = await userService.getAdminUsers(queryPayload);

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getAdminUserDetail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    ensureAdminRequest(req);
    const { id } = req.params;
    const result = await userService.getAdminUserDetail(Number(id));
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const blockUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    ensureAdminRequest(req);
    const { id } = req.params;
    const { blocked } = req.body;

    const result = await userService.blockUser(Number(id), Boolean(blocked));
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    ensureAdminRequest(req);
    const { id } = req.params;
    const result = await userService.deleteUser(Number(id));
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const userController = {
  register,
  submitContact,
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
  getAdminUsers,
  getAdminUserDetail,
  blockUser,
  deleteUser,
};
