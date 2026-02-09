export interface CreateQuiz {
  lessonId: number;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
}

export interface UpdateQuiz {
  title?: string;
  description?: string;
  timeLimit?: number;
  passingScore?: number;
}

export interface Quiz {
  id: number;
  lessonId: number;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  createdAt: Date;
  updatedAt: Date;
}
