import { prisma } from "@/lib/prisma.js";
import { getIO } from "@/socket/index.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const getSocketIO = () => getIO();

type SendDirectMessageInput = {
  conversationId?: number;
  recipientId?: number;
  content?: string;
  imgUrl?: string;
};

const resolveStudentLecturerPair = async (
  userAId: number,
  userBId: number,
  tx: any,
) => {
  if (userAId === userBId) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Student and lecturer must be 2 different users.",
    );
  }

  const users = await tx.user.findMany({
    where: {
      id: { in: [userAId, userBId] },
      isDestroyed: false,
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (users.length !== 2) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found.");
  }

  const userA = users.find((user: { id: number }) => user.id === userAId);
  const userB = users.find((user: { id: number }) => user.id === userBId);

  if (!userA || !userB) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found.");
  }

  const roleA = userA.role.toLowerCase();
  const roleB = userB.role.toLowerCase();

  if (roleA === "student" && roleB === "lecturer") {
    return { studentId: userA.id, lecturerId: userB.id };
  }

  if (roleA === "lecturer" && roleB === "student") {
    return { studentId: userB.id, lecturerId: userA.id };
  }

  throw new ApiError(
    StatusCodes.UNPROCESSABLE_ENTITY,
    "Direct conversation only supports student and lecturer.",
  );
};

const sendDirectMessage = async (
  senderId: number,
  input: SendDirectMessageInput,
) => {
  const content = input.content?.trim() ?? null;
  const imgUrl = input.imgUrl?.trim() ?? null;

  if (!content && !imgUrl) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Message content is required.");
  }

  const result = await prisma.$transaction(async (tx) => {
    let conversationId = input.conversationId;
    let recipientId = input.recipientId;
    let createdConversation = false;

    if (conversationId) {
      const conversation = await tx.conversation.findUnique({
        where: {
          id: conversationId,
          isDestroyed: false,
        },
        include: {
          members: true,
        },
      });

      if (!conversation) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          "Conversation does not exist.",
        );
      }

      const senderMember = conversation.members.find(
        (member) => member.userId === senderId,
      );
      if (!senderMember) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          "You do not have permission to send message in this conversation.",
        );
      }

      const recipientMember = conversation.members.find(
        (member) => member.userId !== senderId,
      );
      recipientId = recipientMember?.userId;
    } else {
      if (!recipientId) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "recipientId is required when conversationId is missing.",
        );
      }

      const { studentId, lecturerId } = await resolveStudentLecturerPair(
        senderId,
        recipientId,
        tx,
      );

      const existedConversation = await tx.conversation.findFirst({
        where: {
          studentId,
          lecturerId,
          isDestroyed: false,
        },
      });
      createdConversation = !existedConversation;

      const upsertConversation = await tx.conversation.upsert({
        where: {
          studentId_lecturerId: {
            studentId,
            lecturerId,
          },
        },
        update: {
          isDestroyed: false,
        },
        create: {
          studentId,
          lecturerId,
          members: {
            create: [
              {
                userId: studentId,
                role: "STUDENT",
              },
              {
                userId: lecturerId,
                role: "LECTURER",
              },
            ],
          },
        },
      });

      await tx.conversationMember.upsert({
        where: {
          conversationId_userId: {
            conversationId: upsertConversation.id,
            userId: studentId,
          },
        },
        update: {
          role: "STUDENT",
        },
        create: {
          conversationId: upsertConversation.id,
          userId: studentId,
          role: "STUDENT",
        },
      });

      await tx.conversationMember.upsert({
        where: {
          conversationId_userId: {
            conversationId: upsertConversation.id,
            userId: lecturerId,
          },
        },
        update: {
          role: "LECTURER",
        },
        create: {
          conversationId: upsertConversation.id,
          userId: lecturerId,
          role: "LECTURER",
        },
      });

      conversationId = upsertConversation.id;
    }

    if (!conversationId) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Cannot resolve conversation.",
      );
    }

    const message = await tx.message.create({
      data: {
        conversationId,
        senderId,
        content,
        imgUrl,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: {
              select: {
                fileUrl: true,
              },
            },
          },
        },
      },
    });

    await tx.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageId: message.id,
        lastMessageSenderId: senderId,
        lastMessageContent: message.content,
        lastMessageAt: message.createdAt,
      },
    });

    await tx.conversationMember.updateMany({
      where: {
        conversationId,
        userId: { not: senderId },
      },
      data: {
        unreadCount: {
          increment: 1,
        },
      },
    });

    await tx.conversationMember.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: senderId,
        },
      },
      data: {
        unreadCount: 0,
        lastReadAt: message.createdAt,
        lastSeenMessageId: message.id,
      },
    });

    const updatedConversation = await tx.conversation.findUnique({
      where: { id: conversationId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: {
                  select: {
                    fileUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!updatedConversation) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Cannot update conversation.",
      );
    }

    const unreadCounts = Object.fromEntries(
      updatedConversation.members.map((member) => [
        member.userId.toString(),
        member.unreadCount,
      ]),
    );

    return {
      createdConversation,
      recipientId,
      message: {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        imgUrl: message.imgUrl,
        createdAt: message.createdAt,
        sender: {
          id: message.sender.id,
          firstName: message.sender.firstName,
          lastName: message.sender.lastName,
          avatarUrl: message.sender.avatar?.fileUrl ?? null,
        },
      },
      conversation: {
        id: updatedConversation.id,
        studentId: updatedConversation.studentId,
        lecturerId: updatedConversation.lecturerId,
        lastMessageId: updatedConversation.lastMessageId,
        lastMessageSenderId: updatedConversation.lastMessageSenderId,
        lastMessageContent: updatedConversation.lastMessageContent,
        lastMessageAt: updatedConversation.lastMessageAt,
      },
      unreadCounts,
    };
  });

  getSocketIO()
    .to(`conversation:${result.conversation.id}`)
    .emit("new-message", {
      message: result.message,
      conversation: result.conversation,
      unreadCounts: result.unreadCounts,
    });

  if (result.createdConversation && result.recipientId) {
    getSocketIO().to(`user:${result.recipientId}`).emit("new-conversation", {
      conversation: result.conversation,
    });
  }

  return {
    message: result.message,
    conversation: result.conversation,
    unreadCounts: result.unreadCounts,
  };
};

export const messageService = {
  sendDirectMessage,
};
