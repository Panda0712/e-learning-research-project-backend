import { User } from "@/types/user.type.js";
import { StatusCodes } from "http-status-codes";
import _ from "lodash";
import ApiError from "./ApiError.js";
import { prisma } from "@/lib/prisma.js";

// create a slug based on a string
export const slugify = (val: string) => {
  if (!val) return "";
  return String(val)
    .normalize("NFKD") // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, "") // remove all the accents, which happen to be all in the \u03xx UNICODE block.
    .trim() // trim leading or trailing whitespace
    .toLowerCase() // convert to lowercase
    .replace(/[^a-z0-9 -]/g, "") // remove non-alphanumeric characters
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-"); // remove consecutive hyphens
};

export const pickUser = (user: User) => {
  if (!user) return;

  return _.pick(user, [
    "id",
    "firstName",
    "lastName",
    "email",
    "avatar",
    "role",
    "isVerified",
    "createdAt",
    "updatedAt",
  ]);
};

export const calculateDateRange = (
  period: string,
  customFrom?: string,
  customTo?: string,
) => {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();
  let groupBy: "day" | "month" = "day";

  switch (period) {
    case "this_month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      groupBy = "day";
      break;
    case "last_month":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      groupBy = "day";
      break;
    case "this_year":
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      groupBy = "month";
      break;
    case "custom":
      if (!customFrom || !customTo) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Vui lòng chọn ngày bắt đầu và kết thúc!",
        );
      }
      startDate = new Date(customFrom);
      endDate = new Date(customTo);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      groupBy = diffDays > 60 ? "month" : "day";
      break;
    case "all_time":
      startDate = new Date(2020, 0, 1);
      endDate = new Date();
      groupBy = "month";
      break;
    default:
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      groupBy = "month";
  }
  return { startDate, endDate, groupBy };
};

export const initChartData = (
  startDate: Date,
  endDate: Date,
  groupBy: "day" | "month",
) => {
  const labels: string[] = [];
  const emptyData: number[] = [];

  if (groupBy === "month") {
    for (let i = 0; i < 12; i++) {
      const d = new Date(startDate.getFullYear(), i, 1);
      labels.push(d.toLocaleString("en-us", { month: "short" }));
      emptyData.push(0);
    }
  } else {
    const tempDate = new Date(startDate);
    while (tempDate <= endDate) {
      labels.push(
        tempDate.getDate().toString().padStart(2, "0") +
          "/" +
          (tempDate.getMonth() + 1).toString().padStart(2, "0"),
      );
      emptyData.push(0);
      tempDate.setDate(tempDate.getDate() + 1);
    }
  }
  return { labels, emptyData };
};

export const getDateIndex = (date: Date, startDate: Date, groupBy: string) => {
  if (groupBy === "month") return date.getMonth();
  const diffTime = Math.abs(date.getTime() - startDate.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const getPermissionsFromRole = async (roleName: string) => {
  try {
    const role = await prisma.role.findUnique({
      where: { name: roleName, isDestroyed: false },
    });
    if (!role) return [];
    if (typeof role.permissions !== "string") return [];

    let permissions = new Set(JSON.parse(role.permissions));
    const inheritsArray =
      typeof role.inherits === "string" ? JSON.parse(role.inherits) : [];

    if (inheritsArray.length > 0) {
      for (const inheritRoleName of inheritsArray) {
        const inheritedPermissions =
          await getPermissionsFromRole(inheritRoleName);
        inheritedPermissions?.forEach((i) => permissions.add(i));
      }
    }

    return Array.from(permissions);
  } catch (error: any) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Oops! Something went wrong!",
    );
  }
};
