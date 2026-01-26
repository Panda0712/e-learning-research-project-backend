import { prisma } from '../lib/prisma.js';


const createCategory = async (data: any) => {
  return await prisma.courseCategory.create({
    data: {
      name: data.name,
      slug: data.slug,
    },
  });
};

const getAllCategories = async () => {
  return await prisma.courseCategory.findMany({
    where: { isDestroyed: false },
  });
};

export const courseCategoryService = {
  createCategory,
  getAllCategories,
};