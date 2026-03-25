import ApiError from "@/utils/ApiError.js";
import { getPermissionsFromRole } from "@/utils/helpers.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const isValidPermission =
  (requiredPermissions: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // get user roles
      const userRole = req.jwtDecoded?.role;

      // check user roles
      if (!userRole || typeof userRole !== "string") {
        return next(
          new ApiError(
            StatusCodes.FORBIDDEN,
            "Forbidden: Something wrong with your role!",
          ),
        );
      }

      // get userPermissions from user role
      let userPermissions = new Set();
      const rolePermissions = await getPermissionsFromRole(userRole);
      rolePermissions.forEach((i) => userPermissions.add(i));

      // check permissions
      const hasPermission = requiredPermissions.every((i) =>
        userPermissions.has(i),
      );
      if (!hasPermission) {
        return next(
          new ApiError(
            StatusCodes.FORBIDDEN,
            "Forbidden: You don't have permission!",
          ),
        );
      }

      return next();
    } catch (error) {
      return next(
        new ApiError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          "Oops! Something went wrong!",
        ),
      );
    }
  };

export const rbacMiddleware = {
  isValidPermission,
};
