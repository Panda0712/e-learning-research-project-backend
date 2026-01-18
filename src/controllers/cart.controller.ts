import type { Request, Response } from 'express';
import { CartService } from '../services/cart.service';

export class CartController {
  private service = new CartService();

  // [POST] /api/cart/add
  addToCart = async (req: Request, res: Response) => {
    try {
      // Giả sử userId lấy từ body
      const { userId, courseId } = req.body;

      if (!userId || !courseId) {
        return res.status(400).json({ message: "Thiếu userId hoặc courseId" });
      }

      const newItem = await this.service.addToCart(Number(userId), Number(courseId));
      
      return res.status(201).json({
        status: "success",
        message: "Đã thêm vào giỏ hàng thành công!",
        data: newItem
      });
    } catch (error: any) {
      return res.status(400).json({ 
        status: "error", 
        message: error.message || "Lỗi khi thêm vào giỏ hàng" 
      });
    }
  }

  // [GET] /api/cart/:userId
  getCart = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const data = await this.service.getCartByUserId(Number(userId));

      return res.status(200).json({
        status: "success",
        data: data
      });
    } catch (error) {
      return res.status(500).json({ message: "Lỗi server" });
    }
  }

  // [DELETE] /api/cart/:id
  removeCartItem = async (req: Request, res: Response) => {
    try {
      const { id } = req.params; // ID của cái Cart Item 
      await this.service.removeFromCart(Number(id));

      return res.status(200).json({
        status: "success",
        message: "Đã xóa khỏi giỏ hàng"
      });
    } catch (error) {
      return res.status(500).json({ message: "Lỗi không thể xóa item" });
    }
  }
}