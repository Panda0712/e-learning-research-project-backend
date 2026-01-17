import { Router } from 'express';
import { BlogCategoryController } from '../controllers/blog_category.controller';

const router = Router();
const controller = new BlogCategoryController();

router.get('/', controller.getAll);
router.post('/', controller.create);
router.delete('/:id', controller.delete);

export default router;