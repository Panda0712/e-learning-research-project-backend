export interface CreateLesson {
  resource: LessonFile;
  moduleId: number;
  title: string;
  description: string;
  note: string;
  video: LessonFile;
  duration: string;
}

export interface LessonFile {
  publicId: string;
  fileUrl: string;
  fileSize?: number | null;
  fileType?: string | null;
}

export interface UpdateLesson {
  title?: string;
  description?: string;
  note?: string;
  video?: LessonFile;
  resource?: LessonFile;
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
