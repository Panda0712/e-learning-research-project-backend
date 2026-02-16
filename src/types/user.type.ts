export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string | null;
  lastName: string | null;
  avatar?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: Date | null;
  role: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt?: Date | null;
  isDestroyed?: boolean;
}

export interface IUser {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatar?: string | null;
  role: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt?: Date | null;
}
