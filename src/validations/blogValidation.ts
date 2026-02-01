import Joi from "joi";

// --- VALIDATION CATEGORY ---
const createCategory = Joi.object({
  name: Joi.string().required().min(2).messages({
    "string.empty": "Tên danh mục không được để trống",
  }),
});

const updateCategory = Joi.object({
  name: Joi.string().min(2).optional(),
});

// --- VALIDATION POST ---
const createPost = Joi.object({
  title: Joi.string().required().min(5).max(255).messages({
    "string.empty": "Tiêu đề không được để trống",
  }),
  content: Joi.string().required().min(10),
  thumbnail: Joi.string().uri().optional().allow(null, ""),
  tags: Joi.array().items(Joi.string()).optional(),
  categoryId: Joi.number().integer().optional(),
});

const updatePost = Joi.object({
  title: Joi.string().min(5).max(255).optional(),
  content: Joi.string().min(10).optional(),
  thumbnail: Joi.string().uri().optional().allow(null, ""),
  tags: Joi.array().items(Joi.string()).optional(),
  categoryId: Joi.number().integer().optional(),
  isPublished: Joi.boolean().optional(),
});

// --- VALIDATION COMMENT ---
const createComment = Joi.object({
  content: Joi.string().required().messages({
    "string.empty": "Nội dung bình luận không được để trống",
  }),
  postId: Joi.number().integer().required(),
  parentId: Joi.number().integer().optional().allow(null),
});

export const blogValidation = {
  createCategory,
  updateCategory,
  createPost,
  updatePost,
  createComment,
};