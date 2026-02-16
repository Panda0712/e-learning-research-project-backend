import { Socket } from "socket.io";
import { IUser } from "./user.type.js";

export interface AuthenticatedSocket extends Socket {
  user?: IUser;
}
