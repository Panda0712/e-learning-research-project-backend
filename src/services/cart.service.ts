import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CartService {
  
  // 1. Thêm khóa học vào giỏ
  async addToCart(userId: number, courseId: number) {
    // Kiểm tra xem khóa học này đã có trong giỏ của user chưa
    const existingItem = await prisma.cart.findFirst({
      where: {
        userId: userId,
        courseId: courseId,
        isDestroyed: false // Chỉ check những cái chưa bị xóa
      }
    });

    if (existingItem) {
      throw new Error("Khóa học này đã có trong giỏ hàng rồi!");
    }

    // Lấy thông tin khóa học để điền vào mấy trường phụ
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new Error("Khóa học không tồn tại!");

    // Tạo mới
    return await prisma.cart.create({
      data: {
        userId: userId,
        courseId: courseId,
        courseName: course.name,
        lecturer: course.lecturerName, 
        totalPrice: course.price,
      }
    });
  }

  // 2. Lấy danh sách giỏ hàng của User
  async getCartByUserId(userId: number) {
    return await prisma.cart.findMany({
      where: {
        userId: userId,
        isDestroyed: false,
      },
      include: {
        course: true, // Kèm luôn thông tin chi tiết khóa học (Thumbnail, giá...)
      }
    });
  }

  // 3. Xóa khỏi giỏ hàng
  async removeFromCart(cartId: number) {
    return await prisma.cart.delete({
      where: { id: cartId }
    });
  }
}