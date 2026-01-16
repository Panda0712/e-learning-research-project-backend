export interface User {
  id: number;
  email: string;
  password: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: Date | null;
  role: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt?: Date | null;
  _destroy?: boolean;
}

export interface Course {
  id: number;
  lecturerId: number;
  categoryId?: number | null;
  thumbnail?: string | null;
  name: string;
  lecturerName?: string | null;
  duration?: string | null;
  totalStudents?: number;
  totalLessons?: number;
  totalQuizzes?: number;
  level?: string | null;
  overview?: string | null; // text
  price?: number;
  createdAt: Date;
  updatedAt?: Date | null;
  _destroy?: boolean;
}

export interface CourseCategory {
  id: number;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt?: Date | null;
  _destroy?: boolean;
}

export interface CourseFAQ {
  id: number;
  question: string;
  answer?: string | null; // text
  createdAt: Date;
  updatedAt?: Date | null;
  _destroy?: boolean;
}

export interface CourseReview {
  id: number;
  courseId: number;
  studentId: number;
  studentName?: string | null;
  studentAvatar?: string | null;
  rating: number;
  content?: string | null; // text
  createdAt: Date;
  updatedAt?: Date | null;
  _destroy?: boolean;
}

export interface Module {
  id: number;
  courseId: number;
  title: string;
  description?: string | null; // text
  duration?: string | null;
  totalLessons?: number;
  createdAt: Date;
  updatedAt?: Date | null;
  _destroy?: boolean;
}

export interface Lesson {
  id: number;
  resourceId?: number | null;
  moduleId: number;
  title: string;
  description?: string | null; // text
  note?: string | null; // text
  videoUrl?: string | null;
  duration?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;
  _destroy?: boolean;
}

export interface ResourceFile {
  id: number;
  fileSize?: number | null;
  fileType?: string | null;
  fileUrl: string;
  createdAt: Date;
  updatedAt?: Date | null;
  _destroy?: boolean;
}

export interface ResourceLesson {
  id: number;
  lessonId: number;
  resourceId: number;
  createdAt: Date;
  updatedAt?: Date | null;
  _destroy?: boolean;
}

export interface ResourceLecturer {
  id: number;
  lecturerId: number;
  resourceId: number;
  createdAt: Date;
  updatedAt?: Date | null;
  _destroy?: boolean;
}

export interface Quiz {
  id: number;
  lessonId: number;
  title: string;
  description?: string | null; // text
  timeLimit?: number | null;
  passingScore?: number | null;
  createdAt: Date;
  updatedAt?: Date | null;
  _destroy?: boolean;
}

export interface Question {
  id: number;
  quizId: number;
  question: string;
  type: string; // e.g., 'mcq', 'true_false'
  options?: any[] | null; // array of options
  correctAnswer?: string | null;
  point?: number;
  createdAt: Date;
  updatedAt?: Date | null;
  _destroy?: boolean;
}

export interface Order {
  id: number;
  studentId: number;
  courseId?: number[] | null; // array of course ids
  studentEmail?: string | null;
  studentName?: string | null;
  courseName?: string | null;
  courseThumb?: string | null;
  lecturer?: string | null;
  totalPrice?: number;
  paymentMethod?: string | null;
  status?: string | null;
  createdAt: Date;
  _destroy?: boolean;
}

export interface Enrollment {
  id: number;
  studentId: number;
  courseId: number;
  status?: string | null;
  progress?: number;
  lastAccessedAt?: Date | null;
  createdAt: Date;
  _destroy?: boolean;
}

export interface Coupon {
  id: number;
  name: string;
  description?: string | null; // text
  status?: string | null;
  customerGroup?: string | null;
  code: string;
  categoryId?: number | null;
  quantity?: number | null;
  usesPerCustomer?: number | null;
  priority?: string | null;
  actions?: string | null;
  type?: string | null;
  amount?: number | null;
  startingDate?: Date | null;
  startingTime?: string | null;
  endingDate?: Date | null;
  endingTime?: string | null;
  isUnlimited?: boolean;
  createdAt: Date;
  updatedAt?: Date | null;
  _destroy?: boolean;
}

export interface CouponCategory {
  id: number;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt?: Date | null;
  _destroy?: boolean;
}

export interface Submission {
  id: number;
  assessmentId?: number | null;
  quizId?: number | null;
  studentId: number;
  score?: number | null;
  status?: string | null;
  submittedAt?: Date | null;
  _destroy?: boolean;
}

export interface Assessment {
  id: number;
  courseId?: number | null;
  lessonId?: number | null;
  title: string;
  type?: string | null;
  dueDate?: Date | null;
  status?: string | null;
  totalSubmissions?: number | null;
  averageScore?: number | null;
  createdAt: Date;
  _destroy?: boolean;
}

export interface BlogPost {
  id: number;
  authorId: number;
  categoryId?: number | null;
  title: string;
  slug?: string | null;
  content?: string | null; // text
  thumbnail?: string | null;
  totalComments?: number;
  createdAt: Date;
  updatedAt?: Date | null;
  _destroy?: boolean;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt?: Date | null;
  _destroy?: boolean;
}

export interface BlogComment {
  id: number;
  blogId: number;
  userId: number;
  content?: string | null; // text
  createdAt: Date;
  updatedAt?: Date | null;
  _destroy?: boolean;
}

export interface Wishlist {
  id: number;
  userId: number;
  courseId: number;
  courseThumbnail?: string | null;
  courseName?: string | null;
  lecturer?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;
  _destroy?: boolean;
}

export interface Cart {
  id: number;
  userId: number;
  courseId: number;
  courseName?: string | null;
  lecturer?: string | null;
  totalPrice?: number;
  createdAt: Date;
  _destroy?: boolean;
}

export interface Transaction {
  id: number;
  userId: number;
  userRole?: string | null;
  amount?: number;
  paymentMethod?: string | null;
  status?: string | null;
  gatewayReference?: string | null;
  createdAt: Date;
  _destroy?: boolean;
}

export interface TransactionStudent {
  id: number;
  transactionId: number;
  orderId?: number | null;
  courseId?: number | null;
  isDiscount?: boolean;
  discountAmount?: number | null;
  discountCode?: string | null;
  createdAt: Date;
  _destroy?: boolean;
}

export interface LecturerProfile {
  id: number;
  lecturerId: number;
  resourceId?: number | null;
  gender?: string | null;
  nationality?: string | null;
  professionalTitle?: string | null;
  beginStudies?: Date | null;
  highestDegree?: string | null;
  totalStudents?: number | null;
  totalCourses?: number | null;
  avgRating?: number | null;
  bio?: string | null; // text
  createdAt: Date;
  updatedAt?: Date | null;
  _destroy?: boolean;
}

export interface LecturerPayout {
  id: number;
  transactionId?: number | null;
  lecturerId: number;
  payoutAccountId?: number | null;
  currency?: string | null;
  amount?: number | null;
  payoutMethod?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;
  _destroy?: boolean;
}

export interface LecturerPayoutAccount {
  id: number;
  lecturerId: number;
  cardType?: string | null;
  cardNumber?: string | null;
  cardExpireDate?: Date | null;
  cardCVV?: number | null;
  cardHolderName?: string | null;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt?: Date | null;
  _destroy?: boolean;
}

// Minimal placeholders for tables without explicit columns in the notes
export interface Notification {
  id: number;
  userId?: number | null;
  title?: string | null;
  message?: string | null;
  isRead?: boolean;
  createdAt: Date;
  _destroy?: boolean;
}

export interface Message {
  id: number;
  conversationId?: number | null;
  senderId?: number | null;
  recipientId?: number | null;
  content?: string | null;
  createdAt: Date;
  _destroy?: boolean;
}

export interface Revenue {
  id: number;
  source?: string | null;
  amount?: number | null;
  currency?: string | null;
  date?: Date | null;
  createdAt?: Date | null;
}

export interface Conversation {
  id: number;
  participants?: number[] | null;
  lastMessageAt?: Date | null;
  createdAt?: Date | null;
}
