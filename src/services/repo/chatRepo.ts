import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

type ChatRepoClient = Prisma.TransactionClient | typeof prisma;

const ensureStudentCanChatWithLecturer = async ({
  studentId,
  lecturerId,
  tx = prisma,
}: {
  studentId: number;
  lecturerId: number;
  tx?: ChatRepoClient;
}) => {
  const db = tx ?? prisma;

  const purchasedCourse = await db.course.findFirst({
    where: {
      lecturerId,
      isDestroyed: false,
      orderItems: {
        some: {
          order: {
            studentId,
            isDestroyed: false,
          },
        },
      },
    },
    select: {
      id: true,
    },
  });

  if (!purchasedCourse)
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You can only chat with lecturers whose course you have purchased!",
    );

  return true;
};

export const chatRepo = {
  ensureStudentCanChatWithLecturer,
};
