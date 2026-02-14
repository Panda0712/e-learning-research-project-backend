export interface BlogThumbnail {
  publicId: string;
  fileUrl: string;
  fileSize?: number | null;
  fileType?: string | null;
}

export interface CreateBlogPost {
  authorId: number;
  title: string;
  slug: string;
  content: string;
  thumbnail: BlogThumbnail;
  categoryId: number;
}

export interface UpdateBlogPost {
  title?: string;
  content?: string;
  thumbnail?: BlogThumbnail;
  categoryId?: number;
}

export interface CreateBlogComment {
  content: string;
  blogId: number;
  parentId?: number;
}

export interface UpdateBlogComment {
  content?: string;
  blogId?: number;
  parentId?: number;
}
