import { env } from "@/configs/environment.js";

export const GENDER_SELECT = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
};

export const COURSE_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  PUBLISHED: "published",
  REJECTED: "rejected",
};

export const DEGREE_OPTIONS = {
  BACHELOR: "bachelor",
  MASTER: "master",
  DOCTORAL: "doctoral",
  PROFESSOR: "professor",
  PHD: "phd",
  ASSOCIATE_PROFESSOR: "associate_professor",
  EMERITUS_PROFESSOR: "emeritus_professor",
};

export const WEBSITE_DOMAINS =
  env.BUILD_MODE === "production"
    ? env.WEBSITE_DOMAIN_PRODUCTION
    : env.WEBSITE_DOMAIN_DEVELOPMENT;
