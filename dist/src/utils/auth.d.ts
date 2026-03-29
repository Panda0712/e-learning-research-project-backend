import JWT from "jsonwebtoken";
import { authUtilsPayload } from "@/types/authUtilsPayload.type.js";
import { OAuth2Client } from "google-auth-library";
export declare const authUtils: {
    createTokenPair: (payload: authUtilsPayload, publicKey: string, privateKey: string) => Promise<unknown>;
    verifyToken: (token: string, keySecret: string) => Promise<string | JWT.JwtPayload>;
    decodeToken: (token: string) => string | JWT.JwtPayload;
    getGoogleClient: () => OAuth2Client;
};
//# sourceMappingURL=auth.d.ts.map