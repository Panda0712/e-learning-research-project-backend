import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/lib/prisma.js";
type ChatRepoClient = Prisma.TransactionClient | typeof prisma;
export declare const chatRepo: {
    ensureStudentCanChatWithLecturer: ({ studentId, lecturerId, tx, }: {
        studentId: number;
        lecturerId: number;
        tx?: ChatRepoClient;
    }) => Promise<boolean>;
};
export {};
//# sourceMappingURL=chatRepo.d.ts.map