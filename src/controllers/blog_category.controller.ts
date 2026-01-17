import { Request, Response } from 'express';
import { BlogCategoryService } from '../services/blog_category.service';

const service = new BlogCategoryService();

export class BlogCategoryController {
  async getAll(req: Request, res: Response) {
    try {
      const data = await service.getAll();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi server' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name } = req.body;
      const data = await service.create(name);
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ error: 'Lỗi tạo danh mục' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await service.delete(Number(req.params.id));
      res.status(200).json({ message: 'Đã xóa' });
    } catch (error) {
      res.status(400).json({ error: 'Lỗi xóa danh mục' });
    }
  }
}