import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';

const router = Router();
const controller = new CartController();

// Định nghĩa các đường dẫn
router.post('/add', controller.addToCart);        // Thêm vào giỏ
router.get('/:userId', controller.getCart);       // Xem giỏ hàng của User nào đó
router.delete('/:id', controller.removeCartItem); // Xóa item trong giỏ

export default router;