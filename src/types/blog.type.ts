export interface BlogThumbnail {
  publicId: string;
  fileUrl: string;
  fileSize?: number | null;
  fileType?: string | null;
}

export type BlogPostStatus =
  | "draft"
  | "pending"
  | "published"
  | "rejected"
  | "archived";

export type BlogActorRole = "admin" | "lecturer" | "student";

export interface BlogActor {
  id: number;
  role: BlogActorRole;
}

export interface CreateBlogPost {
  authorId: number;
  title: string;
  slug: string;
  content: string;
  thumbnail: BlogThumbnail;
  categoryId: number;
  status?: BlogPostStatus;
}

export interface UpdateBlogPost {
  title?: string;
  content?: string;
  thumbnail?: BlogThumbnail;
  categoryId?: number;
  status?: BlogPostStatus;
}

export interface UpdateBlogPostStatus {
  status: BlogPostStatus;
  reviewNote?: string;
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

export interface BanBlogCommentUserPayload {
  userId: number;
  reason?: string;
}
