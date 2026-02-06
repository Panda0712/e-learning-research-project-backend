export interface KeyStore {
  id: number;
  userId: number;
  publicKey: string;
  privateKey: string;
  refreshTokenUsed: string[];
  refreshToken?: string | null;
  kid: string;
  createdAt: Date;
  updatedAt?: Date | null;
  _destroy?: boolean;
}
