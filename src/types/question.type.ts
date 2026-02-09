export interface CreateQuestion {
  quizId: number;
  question: string;
  type: string;
  options: string[];
  correctAnswer: string;
  point: number;
}

export interface UpdateQuestion {
  question?: string;
  type?: string;
  options?: string[];
  correctAnswer?: string;
  point?: number;
}

export interface Question {
  id: number;
  quizId: number;
  question: string;
  type: string;
  options: string[];
  correctAnswer: string;
  point: number;
  createdAt: Date;
  updatedAt: Date;
}
