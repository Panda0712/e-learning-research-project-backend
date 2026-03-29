declare class KeyTokenService {
    static createKeyToken: ({ userId, publicKey, privateKey, refreshToken, kid, }: {
        userId: number;
        publicKey: string;
        privateKey: string;
        refreshToken?: string | null;
        kid: string;
    }) => Promise<string | {
        createdAt: Date;
        updatedAt: Date;
        isDestroyed: boolean;
        id: number;
        userId: number;
        publicKey: string;
        privateKey: string;
        refreshToken: string | null;
        refreshTokenUsed: import("@prisma/client/runtime/client").JsonValue;
        kid: string;
    }>;
    static findByUserId: (userId: number) => Promise<{
        createdAt: Date;
        updatedAt: Date;
        isDestroyed: boolean;
        id: number;
        userId: number;
        publicKey: string;
        privateKey: string;
        refreshToken: string | null;
        refreshTokenUsed: import("@prisma/client/runtime/client").JsonValue;
        kid: string;
    } | null>;
    static removeKeyById: (id: number) => Promise<{
        createdAt: Date;
        updatedAt: Date;
        isDestroyed: boolean;
        id: number;
        userId: number;
        publicKey: string;
        privateKey: string;
        refreshToken: string | null;
        refreshTokenUsed: import("@prisma/client/runtime/client").JsonValue;
        kid: string;
    }>;
    static findByRefreshToken: (refreshToken: string) => Promise<{
        createdAt: Date;
        updatedAt: Date;
        isDestroyed: boolean;
        id: number;
        userId: number;
        publicKey: string;
        privateKey: string;
        refreshToken: string | null;
        refreshTokenUsed: import("@prisma/client/runtime/client").JsonValue;
        kid: string;
    } | null>;
    static findByRefreshTokenUsed: (refreshToken: string) => Promise<{
        createdAt: Date;
        updatedAt: Date;
        isDestroyed: boolean;
        id: number;
        userId: number;
        publicKey: string;
        privateKey: string;
        refreshToken: string | null;
        refreshTokenUsed: import("@prisma/client/runtime/client").JsonValue;
        kid: string;
    } | null>;
    static deleteKeyById: (userId: number) => Promise<{
        createdAt: Date;
        updatedAt: Date;
        isDestroyed: boolean;
        id: number;
        userId: number;
        publicKey: string;
        privateKey: string;
        refreshToken: string | null;
        refreshTokenUsed: import("@prisma/client/runtime/client").JsonValue;
        kid: string;
    }>;
}
export default KeyTokenService;
//# sourceMappingURL=keyTokenService.d.ts.map