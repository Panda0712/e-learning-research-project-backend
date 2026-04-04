import { env } from "@/configs/environment.js";

export const ACCOUNT_ROLES = {
  ADMIN: "admin",
  LECTURER: "lecturer",
  STUDENT: "student",
};

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

export const WHITELIST_DOMAINS = [
  "http://localhost:5173",
  "http://localhost:8017",
  "https://e-learning-research-project-fronten.vercel.app",
];

export const DEFAULT_PAGE = 1;
export const DEFAULT_ITEMS_PER_PAGE = 8;

export const FE_OAUTH_CALLBACK = `${WEBSITE_DOMAINS}/auth/google/callback`;
export const FE_ORIGIN = new URL(WEBSITE_DOMAINS as string).origin;

export const CONTACT_COOLDOWN_SECONDS = 45;
export const CONTACT_DEDUPE_SECONDS = 600;
export const CONTACT_IP_DAILY_LIMIT = 20;
export const CONTACT_EMAIL_DAILY_LIMIT = 10;
export const CONTACT_DAILY_WINDOW_SECONDS = 86400;
