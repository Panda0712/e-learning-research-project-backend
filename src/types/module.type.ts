export interface CreateModule {
  courseId: number;
  title: string;
  description: string;
  duration: string;
  totalLessons: number;
}

export interface UpdateModule {
  title?: string;
  description?: string;
  duration?: string;
  totalLessons?: number;
}

export interface Module {
  id: number;
  courseId: number;
  title: string;
  description: string;
  duration: string;
  totalLessons: number;
  createdAt: Date;
  updatedAt: Date;
}
