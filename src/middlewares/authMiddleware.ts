import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import KeyTokenService from "@/services/keyTokenService.js"; 

interface AuthRequest extends Request {
  user?: any;
  keyStore?: any;
}

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // 1. Lấy Token từ Header gửi lên
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
       return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Chưa đăng nhập!" });
    }
    const accessToken = authHeader.split(" ")[1] as string;

    // 2. Decode Token
    const decodedUser = jwt.decode(accessToken) as any;
    if (!decodedUser?.userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Token lỗi!" });
    }

    // 3. SERVICE 
    const keyStore = await KeyTokenService.findByUserId(decodedUser.userId);

    if (!keyStore) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Không tìm thấy Key Store!" });
    }

    // 4. Dùng publicKey lấy từ DB để kiểm tra Token 
    const decoded = jwt.verify(accessToken, keyStore.publicKey);

    // 5. Gắn thông tin vào req để Controller dùng
    req.user = decoded; 
    req.keyStore = keyStore;
    
    next(); 

  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Token hết hạn hoặc không hợp lệ!" });
  }
};