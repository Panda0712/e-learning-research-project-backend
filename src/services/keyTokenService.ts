import { prisma } from "@/lib/prisma.js";

class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken = null,
  }: {
    userId: number;
    publicKey: string;
    privateKey: string;
    refreshToken?: string | null;
  }) => {
    const existingKeyToken = await prisma.keyToken.findUnique({
      where: { userId, isDestroyed: false },
    });

    const tokens = await prisma.keyToken.upsert({
      where: { userId },
      update: {
        publicKey,
        privateKey,
        refreshToken,
        refreshTokenUsed: existingKeyToken?.refreshTokenUsed ?? [],
      },
      create: {
        userId,
        publicKey,
        privateKey,
        refreshToken,
        refreshTokenUsed: [],
      },
    });

    return tokens.publicKey ?? null;
  };

  static findByUserId = async (userId: number) => {
    return await prisma.keyToken.findUnique({
      where: { userId, isDestroyed: false },
    });
  };

  static removeKeyById = async (id: number) => {
    return await prisma.keyToken.update({
      where: { id },
      data: {
        isDestroyed: true,
      },
    });
  };

  static findByRefreshToken = async (refreshToken: string) => {
    return await prisma.keyToken.findFirst({
      where: { refreshToken, isDestroyed: false },
    });
  };

  static findByRefreshTokenUsed = async (refreshToken: string) => {
    return await prisma.keyToken.findFirst({
      where: {
        isDestroyed: false,
        refreshTokenUsed: {
          array_contains: refreshToken,
        },
      },
    });
  };

  static deleteKeyById = async (userId: number) => {
    return await prisma.keyToken.update({
      where: { userId },
      data: { isDestroyed: true },
    });
  };
}

export default KeyTokenService;
