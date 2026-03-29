import { prisma } from "@/lib/prisma.js";
import { getIO } from "@/socket/index.js";
import ApiError from "@/utils/ApiError.js";
import { normalizeConversationRole } from "@/utils/helpers.js";
import { StatusCodes } from "http-status-codes";
import { notificationService } from "./notificationService.js";
import { chatRepo } from "./repo/chatRepo.js";

const getSocketIO = () => getIO();

type SendDirectMessageInput = {
  conversationId?: number;
  recipientId?: number;
  content?: string;
  imgUrl?: string;
};

type ConversationWithRelations = {
  id: number;
  studentId: number;
  lecturerId: number;
  lastMessageId: number | null;
  lastMessageSenderId: number | null;
  lastMessageContent: string | null;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  members: Array<{
    userId: number;
    role: "STUDENT" | "LECTURER";
    unreadCount: number;
    joinedAt: Date;
    lastReadAt: Date | null;
    lastSeenMessageId: number | null;
    user: {
      id: number;
      firstName: string | null;
      lastName: string | null;
      avatar: { fileUrl: string } | null;
    };
  }>;
};

const buildConversationPayload = (
  conversation: ConversationWithRelations,
  currentUserId: number,
) => {
  const participants = conversation.members.map((member) => ({
    id: member.user.id,
    firstName: member.user.firstName,
    lastName: member.user.lastName,
    avatarUrl: member.user.avatar?.fileUrl ?? null,
    role: normalizeConversationRole(member.role),
    joinedAt: member.joinedAt,
    lastReadAt: member.lastReadAt,
    unreadCount: member.unreadCount,
  }));

  const unreadCounts = Object.fromEntries(
    conversation.members.map((member) => [
      member.userId.toString(),
      member.unreadCount,
    ]),
  );

  const seenBy = conversation.members
    .filter(
      (member) =>
        conversation.lastMessageId &&
        member.lastSeenMessageId === conversation.lastMessageId,
    )
    .map((member) => ({
      id: member.user.id,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
      avatarUrl: member.user.avatar?.fileUrl ?? null,
    }));

  const myMember = conversation.members.find(
    (member) => member.userId === currentUserId,
  );

  return {
    id: conversation.id,
    studentId: conversation.studentId,
    lecturerId: conversation.lecturerId,
    lastMessageId: conversation.lastMessageId,
    lastMessageContent: conversation.lastMessageContent,
    lastMessageSenderId: conversation.lastMessageSenderId,
    lastMessageAt: conversation.lastMessageAt,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    participants,
    seenBy,
    unreadCounts,
    myUnreadCount: myMember?.unreadCount ?? 0,
  };
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

      const sender = await tx.user.findUnique({
        where: { id: senderId, isDestroyed: false },
        select: { role: true },
      });

      if (sender?.role?.toLowerCase() !== "student") {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          "Only students can start a new conversation.",
        );
      }

      const { studentId, lecturerId } = await resolveStudentLecturerPair(
        senderId,
        recipientId,
        tx,
      );

      await chatRepo.ensureStudentCanChatWithLecturer({
        studentId,
        lecturerId,
        tx,
      });

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

    const conversationPayloadForSender = buildConversationPayload(
      updatedConversation as ConversationWithRelations,
      senderId,
    );

    const conversationPayloadForRecipient = recipientId
      ? buildConversationPayload(
          updatedConversation as ConversationWithRelations,
          recipientId,
        )
      : null;

    return {
      createdConversation,
      recipientId,
      recipientConversation: conversationPayloadForRecipient,
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
      conversation: conversationPayloadForSender,
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

  if (
    result.createdConversation &&
    result.recipientId &&
    result.recipientConversation
  ) {
    getSocketIO().to(`user:${result.recipientId}`).emit("new-conversation", {
      conversation: result.recipientConversation,
    });
  }

  if (result.recipientId && result.recipientId !== senderId) {
    const senderName =
      `${result.message.sender.firstName || ""} ${result.message.sender.lastName || ""}`.trim();
    const preview = result.message.content || "sent an image";

    await notificationService.createAndDispatchNotification(
      {
        userId: result.recipientId,
        title: "New message",
        message: `${senderName || "A user"}: ${preview}`,
        type: "message",
        relatedId: result.conversation.id,
      },
      { dedupe: false },
    );
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
