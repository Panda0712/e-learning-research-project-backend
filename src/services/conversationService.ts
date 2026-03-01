import { prisma } from "@/lib/prisma.js";
import { getIO } from "@/socket/index.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const getSocketIO = () => getIO();

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

const conversationInclude = {
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
  lastMessageSender: {
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
} as const;

const buildConversationPayload = (
  conversation: ConversationWithRelations,
  currentUserId: number,
) => {
  const participants = conversation.members.map((member) => ({
    id: member.user.id,
    firstName: member.user.firstName,
    lastName: member.user.lastName,
    avatarUrl: member.user.avatar?.fileUrl ?? null,
    role: member.role,
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

const resolveStudentLecturerPair = async (userAId: number, userBId: number) => {
  if (userAId === userBId) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Student and lecturer must be 2 different users.",
    );
  }

  const users = await prisma.user.findMany({
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

  const userA = users.find((user) => user.id === userAId);
  const userB = users.find((user) => user.id === userBId);

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

const ensureConversationMember = async (
  conversationId: number,
  userId: number,
) => {
  const member = await prisma.conversationMember.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  });

  if (!member) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You do not have permission to access this conversation.",
    );
  }

  return member;
};

const createConversation = async (
  currentUserId: number,
  recipientId: number,
) => {
  const { studentId, lecturerId } = await resolveStudentLecturerPair(
    currentUserId,
    recipientId,
  );

  const existedConversation = await prisma.conversation.findFirst({
    where: {
      studentId,
      lecturerId,
      isDestroyed: false,
    },
    include: conversationInclude,
  });

  if (existedConversation) {
    return {
      conversation: buildConversationPayload(
        existedConversation as ConversationWithRelations,
        currentUserId,
      ),
    };
  }

  const conversation = await prisma.$transaction(async (tx) => {
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

    const createdConversation = await tx.conversation.findUnique({
      where: { id: upsertConversation.id },
      include: conversationInclude,
    });

    if (!createdConversation) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Cannot create conversation.",
      );
    }

    return createdConversation;
  });

  const payload = buildConversationPayload(
    conversation as ConversationWithRelations,
    currentUserId,
  );

  const targetUserId = currentUserId === studentId ? lecturerId : studentId;

  getSocketIO().to(`user:${targetUserId}`).emit("new-conversation", {
    conversation: payload,
  });

  return { conversation: payload };
};

const getConversations = async (currentUserId: number) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      isDestroyed: false,
      OR: [{ studentId: currentUserId }, { lecturerId: currentUserId }],
    },
    include: conversationInclude,
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
  });

  return {
    conversations: conversations.map((conversation) =>
      buildConversationPayload(
        conversation as ConversationWithRelations,
        currentUserId,
      ),
    ),
  };
};

const getMessages = async (
  conversationId: number,
  currentUserId: number,
  options: { limit?: number; cursor?: string },
) => {
  await ensureConversationMember(conversationId, currentUserId);

  const limit = options.limit ?? 50;
  const cursorDate = options.cursor ? new Date(options.cursor) : null;
  const hasValidCursor =
    cursorDate instanceof Date && !Number.isNaN(cursorDate.getTime());

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      isDestroyed: false,
      ...(hasValidCursor ? { createdAt: { lt: cursorDate! } } : {}),
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
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
  });

  let nextCursor: string | null = null;

  if (messages.length > limit) {
    const nextMessage = messages[messages.length - 1];
    if (nextMessage) {
      nextCursor = nextMessage.createdAt.toISOString();
    }
    messages.pop();
  }

  return {
    messages: messages.reverse().map((message) => ({
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
    })),
    nextCursor,
  };
};

const markAsSeen = async (conversationId: number, currentUserId: number) => {
  await ensureConversationMember(conversationId, currentUserId);

  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
      isDestroyed: false,
    },
    include: conversationInclude,
  });

  if (!conversation) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Conversation does not exist.");
  }

  if (!conversation.lastMessageId || !conversation.lastMessageAt) {
    return { message: "No message to mark as seen." };
  }

  if (conversation.lastMessageSenderId === currentUserId) {
    return { message: "Sender does not need to mark as seen." };
  }

  const updatedMember = await prisma.conversationMember.update({
    where: {
      conversationId_userId: {
        conversationId,
        userId: currentUserId,
      },
    },
    data: {
      unreadCount: 0,
      lastReadAt: new Date(),
      lastSeenMessageId: conversation.lastMessageId,
    },
  });

  const refreshedConversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: conversationInclude,
  });

  if (!refreshedConversation) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Conversation does not exist.");
  }

  const seenBy = refreshedConversation.members
    .filter(
      (member) =>
        member.lastSeenMessageId === refreshedConversation.lastMessageId,
    )
    .map((member) => ({
      id: member.user.id,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
      avatarUrl: member.user.avatar?.fileUrl ?? null,
    }));

  getSocketIO()
    .to(`conversation:${conversationId}`)
    .emit("read-message", {
      conversation: {
        id: refreshedConversation.id,
        lastMessageId: refreshedConversation.lastMessageId,
        lastMessageAt: refreshedConversation.lastMessageAt,
      },
      seenBy,
      member: {
        userId: currentUserId,
        unreadCount: updatedMember.unreadCount,
        lastReadAt: updatedMember.lastReadAt,
      },
    });

  return {
    message: "Marked as seen",
    seenBy,
    myUnreadCount: updatedMember.unreadCount,
  };
};

const getUserConversationsForSocketIO = async (userId: number) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      isDestroyed: false,
      OR: [{ studentId: userId }, { lecturerId: userId }],
    },
    select: {
      id: true,
    },
  });

  return conversations.map((conversation) => conversation.id);
};

export const conversationService = {
  createConversation,
  getConversations,
  getMessages,
  markAsSeen,
  getUserConversationsForSocketIO,
};
