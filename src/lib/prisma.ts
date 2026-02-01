import { PrismaClient } from "@/generated/prisma/client.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import "dotenv/config";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

const adapter = new PrismaMariaDb({
  host: requiredEnv("DATABASE_HOST"),
  user: requiredEnv("DATABASE_USER"),
  password: requiredEnv("DATABASE_PASSWORD"),
  database: requiredEnv("DATABASE_NAME"),
  port: Number(process.env.DATABASE_PORT) || 3307,
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });

export { prisma };
