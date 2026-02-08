export interface CreateCourse {
  lecturerId: number;
  categoryId: number;
  thumbnail: string;
  name: string;
  lecturerName: string;
  duration: string;
  level: string;
  overview: string;
  price: number;
  status: string;
}

export interface UpdateCourse {
  thumbnail?: string;
  name?: string;
  lecturerName?: string;
  duration?: string;
  level?: string;
  overview?: string;
  price?: number;
  status?: string;
}
