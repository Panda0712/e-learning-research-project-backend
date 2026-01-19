import _ from "lodash";
import { User } from "@/types/user.type.js";

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
