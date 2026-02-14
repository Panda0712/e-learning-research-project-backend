export interface CourseThumbnail {
  publicId: string;
  fileUrl: string;
  fileSize?: number | null;
  fileType?: string | null;
}

export interface CreateCourse {
  lecturerId: number;
  categoryId: number;
  thumbnail: CourseThumbnail;
  name: string;
  lecturerName: string;
  duration: string;
  level: string;
  overview: string;
  price: number;
  status: string;
}

export interface UpdateCourse {
  thumbnail?: CourseThumbnail;
  name?: string;
  lecturerName?: string;
  duration?: string;
  level?: string;
  overview?: string;
  price?: number;
  status?: string;
}
