import { userService } from "@/services/userService.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ms from "ms";

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const createdUser = await userService.register(req.body);

    res.status(StatusCodes.CREATED).json(createdUser);
  } catch (error: any) {
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.login(req.body);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: ms("14 days"),
    });
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: ms("14 days"),
    });

    res.status(StatusCodes.OK).json(result);
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
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    const result = await userService.logout({ keyStore: req.body });

    res.status(StatusCodes.OK).json({
      loggedOut: true,
      ...result,
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
    const { refreshToken, user, keyStore } = req.body;
    const result = await userService.handleRefreshToken({
      refreshToken,
      user,
      keyStore,
    });

    res.status(StatusCodes.OK).json(result);
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
    const userId = 1;

    const userAvatar = null;

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
    const userId = 1;

    const result = await userService.registerLecturerProfile(userId, req.body);

    res.status(StatusCodes.OK).json({
      message: "Submitted lecturer profile successfully!",
      ...result,
    });
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

export const userController = {
  register,
  verifyAccount,
  login,
  logout,
  handleRefreshToken,
  updateProfile,
  registerLecturerProfile,
  forgotPassword,
  resetPassword,
};
