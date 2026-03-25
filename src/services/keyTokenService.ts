import { prisma } from "@/lib/prisma.js";

class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken = null,
    kid,
  }: {
    userId: number;
    publicKey: string;
    privateKey: string;
    refreshToken?: string | null;
    kid: string;
  }) => {
    const existingKeyToken = await prisma.keyToken.findUnique({
      where: { userId },
    });

    if (existingKeyToken) {
      return await prisma.keyToken.update({
        where: { userId },
        data: {
          publicKey,
          privateKey,
          refreshToken,
          kid,
          isDestroyed: false,
          refreshTokenUsed: [],
        },
      });
    }

    const tokens = await prisma.keyToken.create({
      data: {
        userId,
        publicKey,
        privateKey,
        refreshToken,
        kid,
        refreshTokenUsed: [],
        isDestroyed: false,
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
