import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BlogCategoryService {
  // Lấy danh sách
  async getAll() {
    return await prisma.blogCategory.findMany({
      where: { isDestroyed: false },
    });
  }

  // Tạo mới
  async create(name: string) {
    // Tạo slug đơn giản (VD: "Học React" -> "hoc-react")
    const slug = name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Bỏ dấu tiếng Việt
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');

    return await prisma.blogCategory.create({
      data: { name, slug }
    });
  }

  // Xóa (Soft delete)
  async delete(id: number) {
    return await prisma.blogCategory.update({
      where: { id },
      data: { isDestroyed: true }
    });
  }
}