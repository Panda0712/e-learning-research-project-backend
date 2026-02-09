export interface CreateLesson {
  resourceId: number;
  moduleId: number;
  title: string;
  description: string;
  note: string;
  videoUrl: string;
  duration: string;
}

export interface UpdateLesson {
  title?: string;
  description?: string;
  note?: string;
  videoUrl?: string;
  duration?: string;
}

export interface Lesson {
  id: number;
  resourceId: number;
  moduleId: number;
  title: string;
  description: string;
  note: string;
  videoUrl: string;
  duration: string;
  createdAt: Date;
  updatedAt: Date;
}
