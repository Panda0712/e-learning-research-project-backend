import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models.js';
export type * from './prismaNamespace.js';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
/**
 * Helper for filtering JSON entries that have `null` on the database (empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const DbNull: import("@prisma/client-runtime-utils").DbNullClass;
/**
 * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
/**
 * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
export declare const ModelName: {
    readonly User: "User";
    readonly KeyToken: "KeyToken";
    readonly Role: "Role";
    readonly Course: "Course";
    readonly CourseCategory: "CourseCategory";
    readonly CourseFAQ: "CourseFAQ";
    readonly CourseReview: "CourseReview";
    readonly Module: "Module";
    readonly Lesson: "Lesson";
    readonly Resource: "Resource";
    readonly Enrollment: "Enrollment";
    readonly Quiz: "Quiz";
    readonly Question: "Question";
    readonly Order: "Order";
    readonly OrderItem: "OrderItem";
    readonly Coupon: "Coupon";
    readonly CouponCategory: "CouponCategory";
    readonly Submission: "Submission";
    readonly Assessment: "Assessment";
    readonly BlogPost: "BlogPost";
    readonly BlogCategory: "BlogCategory";
    readonly BlogComment: "BlogComment";
    readonly Wishlist: "Wishlist";
    readonly Cart: "Cart";
    readonly CartItem: "CartItem";
    readonly Transaction: "Transaction";
    readonly TransactionStudent: "TransactionStudent";
    readonly LecturerProfile: "LecturerProfile";
    readonly LecturerPayout: "LecturerPayout";
    readonly LecturerPayoutAccount: "LecturerPayoutAccount";
    readonly Revenue: "Revenue";
    readonly Notification: "Notification";
    readonly Conversation: "Conversation";
    readonly ConversationMember: "ConversationMember";
    readonly Message: "Message";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const UserScalarFieldEnum: {
    readonly id: "id";
    readonly email: "email";
    readonly password: "password";
    readonly firstName: "firstName";
    readonly lastName: "lastName";
    readonly avatarId: "avatarId";
    readonly phoneNumber: "phoneNumber";
    readonly dateOfBirth: "dateOfBirth";
    readonly role: "role";
    readonly verifyToken: "verifyToken";
    readonly resetPasswordToken: "resetPasswordToken";
    readonly resetPasswordExpires: "resetPasswordExpires";
    readonly isVerified: "isVerified";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly isDestroyed: "isDestroyed";
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const KeyTokenScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly publicKey: "publicKey";
    readonly privateKey: "privateKey";
    readonly refreshToken: "refreshToken";
    readonly refreshTokenUsed: "refreshTokenUsed";
    readonly kid: "kid";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly isDestroyed: "isDestroyed";
};
export type KeyTokenScalarFieldEnum = (typeof KeyTokenScalarFieldEnum)[keyof typeof KeyTokenScalarFieldEnum];
export declare const RoleScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly permissions: "permissions";
    readonly inherits: "inherits";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly isDestroyed: "isDestroyed";
};
export type RoleScalarFieldEnum = (typeof RoleScalarFieldEnum)[keyof typeof RoleScalarFieldEnum];
export declare const CourseScalarFieldEnum: {
    readonly id: "id";
    readonly lecturerId: "lecturerId";
    readonly categoryId: "categoryId";
    readonly thumbnailId: "thumbnailId";
    readonly name: "name";
    readonly lecturerName: "lecturerName";
    readonly duration: "duration";
    readonly totalStudents: "totalStudents";
    readonly totalLessons: "totalLessons";
    readonly totalQuizzes: "totalQuizzes";
    readonly level: "level";
    readonly overview: "overview";
    readonly price: "price";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly status: "status";
    readonly isDestroyed: "isDestroyed";
};
export type CourseScalarFieldEnum = (typeof CourseScalarFieldEnum)[keyof typeof CourseScalarFieldEnum];
export declare const CourseCategoryScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly slug: "slug";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly isDestroyed: "isDestroyed";
};
export type CourseCategoryScalarFieldEnum = (typeof CourseCategoryScalarFieldEnum)[keyof typeof CourseCategoryScalarFieldEnum];
export declare const CourseFAQScalarFieldEnum: {
    readonly id: "id";
    readonly courseId: "courseId";
    readonly question: "question";
    readonly answer: "answer";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly isDestroyed: "isDestroyed";
};
export type CourseFAQScalarFieldEnum = (typeof CourseFAQScalarFieldEnum)[keyof typeof CourseFAQScalarFieldEnum];
export declare const CourseReviewScalarFieldEnum: {
    readonly id: "id";
    readonly courseId: "courseId";
    readonly studentId: "studentId";
    readonly studentName: "studentName";
    readonly studentAvatar: "studentAvatar";
    readonly rating: "rating";
    readonly content: "content";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly isDestroyed: "isDestroyed";
};
export type CourseReviewScalarFieldEnum = (typeof CourseReviewScalarFieldEnum)[keyof typeof CourseReviewScalarFieldEnum];
export declare const ModuleScalarFieldEnum: {
    readonly id: "id";
    readonly courseId: "courseId";
    readonly title: "title";
    readonly description: "description";
    readonly duration: "duration";
    readonly totalLessons: "totalLessons";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly isDestroyed: "isDestroyed";
};
export type ModuleScalarFieldEnum = (typeof ModuleScalarFieldEnum)[keyof typeof ModuleScalarFieldEnum];
export declare const LessonScalarFieldEnum: {
    readonly id: "id";
    readonly lessonFileId: "lessonFileId";
    readonly moduleId: "moduleId";
    readonly title: "title";
    readonly description: "description";
    readonly note: "note";
    readonly lessonVideoId: "lessonVideoId";
    readonly duration: "duration";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly isDestroyed: "isDestroyed";
};
export type LessonScalarFieldEnum = (typeof LessonScalarFieldEnum)[keyof typeof LessonScalarFieldEnum];
export declare const ResourceScalarFieldEnum: {
    readonly id: "id";
    readonly publicId: "publicId";
    readonly fileSize: "fileSize";
    readonly fileType: "fileType";
    readonly fileUrl: "fileUrl";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly isDestroyed: "isDestroyed";
};
export type ResourceScalarFieldEnum = (typeof ResourceScalarFieldEnum)[keyof typeof ResourceScalarFieldEnum];
export declare const EnrollmentScalarFieldEnum: {
    readonly id: "id";
    readonly studentId: "studentId";
    readonly courseId: "courseId";
    readonly status: "status";
    readonly progress: "progress";
    readonly lastAccessedAt: "lastAccessedAt";
    readonly createdAt: "createdAt";
    readonly isDestroyed: "isDestroyed";
};
export type EnrollmentScalarFieldEnum = (typeof EnrollmentScalarFieldEnum)[keyof typeof EnrollmentScalarFieldEnum];
export declare const QuizScalarFieldEnum: {
    readonly id: "id";
    readonly lessonId: "lessonId";
    readonly title: "title";
    readonly description: "description";
    readonly timeLimit: "timeLimit";
    readonly passingScore: "passingScore";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly isDestroyed: "isDestroyed";
};
export type QuizScalarFieldEnum = (typeof QuizScalarFieldEnum)[keyof typeof QuizScalarFieldEnum];
export declare const QuestionScalarFieldEnum: {
    readonly id: "id";
    readonly quizId: "quizId";
    readonly question: "question";
    readonly type: "type";
    readonly options: "options";
    readonly correctAnswer: "correctAnswer";
    readonly point: "point";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly isDestroyed: "isDestroyed";
};
export type QuestionScalarFieldEnum = (typeof QuestionScalarFieldEnum)[keyof typeof QuestionScalarFieldEnum];
export declare const OrderScalarFieldEnum: {
    readonly id: "id";
    readonly studentId: "studentId";
    readonly lecturer: "lecturer";
    readonly totalPrice: "totalPrice";
    readonly paymentMethod: "paymentMethod";
    readonly status: "status";
    readonly paymentLinkId: "paymentLinkId";
    readonly paymentStatus: "paymentStatus";
    readonly checkoutUrl: "checkoutUrl";
    readonly qrCode: "qrCode";
    readonly isSuccess: "isSuccess";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly isDestroyed: "isDestroyed";
};
export type OrderScalarFieldEnum = (typeof OrderScalarFieldEnum)[keyof typeof OrderScalarFieldEnum];
export declare const OrderItemScalarFieldEnum: {
    readonly id: "id";
    readonly orderId: "orderId";
    readonly courseId: "courseId";
    readonly price: "price";
    readonly lecturerId: "lecturerId";
    readonly createdAt: "createdAt";
    readonly isDestroyed: "isDestroyed";
};
export type OrderItemScalarFieldEnum = (typeof OrderItemScalarFieldEnum)[keyof typeof OrderItemScalarFieldEnum];
export declare const CouponScalarFieldEnum: {
    readonly id: "id";
    readonly courseId: "courseId";
    readonly name: "name";
    readonly description: "description";
    readonly status: "status";
    readonly customerGroup: "customerGroup";
    readonly code: "code";
    readonly categoryId: "categoryId";
    readonly quantity: "quantity";
    readonly usesPerCustomer: "usesPerCustomer";
    readonly priority: "priority";
    readonly actions: "actions";
    readonly type: "type";
    readonly amount: "amount";
    readonly startingDate: "startingDate";
    readonly startingTime: "startingTime";
    readonly endingDate: "endingDate";
    readonly endingTime: "endingTime";
    readonly isUnlimited: "isUnlimited";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly isDestroyed: "isDestroyed";
};
export type CouponScalarFieldEnum = (typeof CouponScalarFieldEnum)[keyof typeof CouponScalarFieldEnum];
export declare const CouponCategoryScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly slug: "slug";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly isDestroyed: "isDestroyed";
};
export type CouponCategoryScalarFieldEnum = (typeof CouponCategoryScalarFieldEnum)[keyof typeof CouponCategoryScalarFieldEnum];
export declare const SubmissionScalarFieldEnum: {
    readonly id: "id";
    readonly assessmentId: "assessmentId";
    readonly quizId: "quizId";
    readonly studentId: "studentId";
    readonly score: "score";
    readonly status: "status";
    readonly feedback: "feedback";
    readonly submittedAt: "submittedAt";
    readonly isDestroyed: "isDestroyed";
};
export type SubmissionScalarFieldEnum = (typeof SubmissionScalarFieldEnum)[keyof typeof SubmissionScalarFieldEnum];
export declare const AssessmentScalarFieldEnum: {
    readonly id: "id";
    readonly courseId: "courseId";
    readonly lessonId: "lessonId";
    readonly title: "title";
    readonly type: "type";
    readonly dueDate: "dueDate";
    readonly status: "status";
    readonly totalSubmissions: "totalSubmissions";
    readonly averageScore: "averageScore";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly isDestroyed: "isDestroyed";
};
export type AssessmentScalarFieldEnum = (typeof AssessmentScalarFieldEnum)[keyof typeof AssessmentScalarFieldEnum];
export declare const BlogPostScalarFieldEnum: {
    readonly id: "id";
    readonly authorId: "authorId";
    readonly categoryId: "categoryId";
    readonly title: "title";
    readonly slug: "slug";
    readonly content: "content";
    readonly thumbnailId: "thumbnailId";
    readonly totalComments: "totalComments";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly isDestroyed: "isDestroyed";
};
export type BlogPostScalarFieldEnum = (typeof BlogPostScalarFieldEnum)[keyof typeof BlogPostScalarFieldEnum];
export declare const BlogCategoryScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly slug: "slug";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly isDestroyed: "isDestroyed";
};
export type BlogCategoryScalarFieldEnum = (typeof BlogCategoryScalarFieldEnum)[keyof typeof BlogCategoryScalarFieldEnum];
export declare const BlogCommentScalarFieldEnum: {
    readonly id: "id";
    readonly blogId: "blogId";
    readonly userId: "userId";
    readonly content: "content";
    readonly parentId: "parentId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly isDestroyed: "isDestroyed";
};
export type BlogCommentScalarFieldEnum = (typeof BlogCommentScalarFieldEnum)[keyof typeof BlogCommentScalarFieldEnum];
export declare const WishlistScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly courseId: "courseId";
    readonly courseThumbnail: "courseThumbnail";
    readonly courseName: "courseName";
    readonly lecturer: "lecturer";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly isDestroyed: "isDestroyed";
};
export type WishlistScalarFieldEnum = (typeof WishlistScalarFieldEnum)[keyof typeof WishlistScalarFieldEnum];
export declare const CartScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly courseName: "courseName";
    readonly lecturer: "lecturer";
    readonly updatedAt: "updatedAt";
    readonly createdAt: "createdAt";
    readonly isDestroyed: "isDestroyed";
};
export type CartScalarFieldEnum = (typeof CartScalarFieldEnum)[keyof typeof CartScalarFieldEnum];
export declare const CartItemScalarFieldEnum: {
    readonly id: "id";
    readonly cartId: "cartId";
    readonly courseId: "courseId";
    readonly price: "price";
    readonly createdAt: "createdAt";
};
export type CartItemScalarFieldEnum = (typeof CartItemScalarFieldEnum)[keyof typeof CartItemScalarFieldEnum];
export declare const TransactionScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly userRole: "userRole";
    readonly amount: "amount";
    readonly paymentMethod: "paymentMethod";
    readonly status: "status";
    readonly gatewayReference: "gatewayReference";
    readonly createdAt: "createdAt";
    readonly isDestroyed: "isDestroyed";
};
export type TransactionScalarFieldEnum = (typeof TransactionScalarFieldEnum)[keyof typeof TransactionScalarFieldEnum];
export declare const TransactionStudentScalarFieldEnum: {
    readonly id: "id";
    readonly transactionId: "transactionId";
    readonly orderId: "orderId";
    readonly courseId: "courseId";
    readonly isDiscount: "isDiscount";
    readonly discountAmount: "discountAmount";
    readonly discountCode: "discountCode";
    readonly createdAt: "createdAt";
    readonly isDestroyed: "isDestroyed";
};
export type TransactionStudentScalarFieldEnum = (typeof TransactionStudentScalarFieldEnum)[keyof typeof TransactionStudentScalarFieldEnum];
export declare const LecturerProfileScalarFieldEnum: {
    readonly id: "id";
    readonly lecturerId: "lecturerId";
    readonly lecturerFileId: "lecturerFileId";
    readonly gender: "gender";
    readonly nationality: "nationality";
    readonly professionalTitle: "professionalTitle";
    readonly beginStudies: "beginStudies";
    readonly highestDegree: "highestDegree";
    readonly totalStudents: "totalStudents";
    readonly totalCourses: "totalCourses";
    readonly avgRating: "avgRating";
    readonly bio: "bio";
    readonly isActive: "isActive";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly isDestroyed: "isDestroyed";
};
export type LecturerProfileScalarFieldEnum = (typeof LecturerProfileScalarFieldEnum)[keyof typeof LecturerProfileScalarFieldEnum];
export declare const LecturerPayoutScalarFieldEnum: {
    readonly id: "id";
    readonly transactionId: "transactionId";
    readonly lecturerId: "lecturerId";
    readonly payoutAccountId: "payoutAccountId";
    readonly currency: "currency";
    readonly amount: "amount";
    readonly payoutMethod: "payoutMethod";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly status: "status";
    readonly isDestroyed: "isDestroyed";
};
export type LecturerPayoutScalarFieldEnum = (typeof LecturerPayoutScalarFieldEnum)[keyof typeof LecturerPayoutScalarFieldEnum];
export declare const LecturerPayoutAccountScalarFieldEnum: {
    readonly id: "id";
    readonly lecturerId: "lecturerId";
    readonly cardType: "cardType";
    readonly cardNumber: "cardNumber";
    readonly cardExpireDate: "cardExpireDate";
    readonly cardCVV: "cardCVV";
    readonly cardHolderName: "cardHolderName";
    readonly isDefault: "isDefault";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly isDestroyed: "isDestroyed";
};
export type LecturerPayoutAccountScalarFieldEnum = (typeof LecturerPayoutAccountScalarFieldEnum)[keyof typeof LecturerPayoutAccountScalarFieldEnum];
export declare const RevenueScalarFieldEnum: {
    readonly id: "id";
    readonly orderId: "orderId";
    readonly lecturerId: "lecturerId";
    readonly courseId: "courseId";
    readonly totalAmount: "totalAmount";
    readonly platformFee: "platformFee";
    readonly lecturerEarn: "lecturerEarn";
    readonly createdAt: "createdAt";
};
export type RevenueScalarFieldEnum = (typeof RevenueScalarFieldEnum)[keyof typeof RevenueScalarFieldEnum];
export declare const NotificationScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly title: "title";
    readonly message: "message";
    readonly type: "type";
    readonly relatedId: "relatedId";
    readonly isRead: "isRead";
    readonly createdAt: "createdAt";
    readonly isDestroyed: "isDestroyed";
};
export type NotificationScalarFieldEnum = (typeof NotificationScalarFieldEnum)[keyof typeof NotificationScalarFieldEnum];
export declare const ConversationScalarFieldEnum: {
    readonly id: "id";
    readonly studentId: "studentId";
    readonly lecturerId: "lecturerId";
    readonly lastMessageId: "lastMessageId";
    readonly lastMessageSenderId: "lastMessageSenderId";
    readonly lastMessageContent: "lastMessageContent";
    readonly lastMessageAt: "lastMessageAt";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly isDestroyed: "isDestroyed";
};
export type ConversationScalarFieldEnum = (typeof ConversationScalarFieldEnum)[keyof typeof ConversationScalarFieldEnum];
export declare const ConversationMemberScalarFieldEnum: {
    readonly conversationId: "conversationId";
    readonly userId: "userId";
    readonly role: "role";
    readonly unreadCount: "unreadCount";
    readonly joinedAt: "joinedAt";
    readonly lastReadAt: "lastReadAt";
    readonly lastSeenMessageId: "lastSeenMessageId";
};
export type ConversationMemberScalarFieldEnum = (typeof ConversationMemberScalarFieldEnum)[keyof typeof ConversationMemberScalarFieldEnum];
export declare const MessageScalarFieldEnum: {
    readonly id: "id";
    readonly conversationId: "conversationId";
    readonly senderId: "senderId";
    readonly content: "content";
    readonly imgUrl: "imgUrl";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly isDestroyed: "isDestroyed";
};
export type MessageScalarFieldEnum = (typeof MessageScalarFieldEnum)[keyof typeof MessageScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const JsonNullValueInput: {
    readonly JsonNull: "JsonNull";
};
export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput];
export declare const NullableJsonNullValueInput: {
    readonly DbNull: "DbNull";
    readonly JsonNull: "JsonNull";
};
export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
export declare const UserOrderByRelevanceFieldEnum: {
    readonly email: "email";
    readonly password: "password";
    readonly firstName: "firstName";
    readonly lastName: "lastName";
    readonly phoneNumber: "phoneNumber";
    readonly role: "role";
    readonly verifyToken: "verifyToken";
    readonly resetPasswordToken: "resetPasswordToken";
};
export type UserOrderByRelevanceFieldEnum = (typeof UserOrderByRelevanceFieldEnum)[keyof typeof UserOrderByRelevanceFieldEnum];
export declare const JsonNullValueFilter: {
    readonly DbNull: "DbNull";
    readonly JsonNull: "JsonNull";
    readonly AnyNull: "AnyNull";
};
export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const KeyTokenOrderByRelevanceFieldEnum: {
    readonly publicKey: "publicKey";
    readonly privateKey: "privateKey";
    readonly refreshToken: "refreshToken";
    readonly kid: "kid";
};
export type KeyTokenOrderByRelevanceFieldEnum = (typeof KeyTokenOrderByRelevanceFieldEnum)[keyof typeof KeyTokenOrderByRelevanceFieldEnum];
export declare const RoleOrderByRelevanceFieldEnum: {
    readonly name: "name";
};
export type RoleOrderByRelevanceFieldEnum = (typeof RoleOrderByRelevanceFieldEnum)[keyof typeof RoleOrderByRelevanceFieldEnum];
export declare const CourseOrderByRelevanceFieldEnum: {
    readonly name: "name";
    readonly lecturerName: "lecturerName";
    readonly duration: "duration";
    readonly level: "level";
    readonly overview: "overview";
    readonly status: "status";
};
export type CourseOrderByRelevanceFieldEnum = (typeof CourseOrderByRelevanceFieldEnum)[keyof typeof CourseOrderByRelevanceFieldEnum];
export declare const CourseCategoryOrderByRelevanceFieldEnum: {
    readonly name: "name";
    readonly slug: "slug";
};
export type CourseCategoryOrderByRelevanceFieldEnum = (typeof CourseCategoryOrderByRelevanceFieldEnum)[keyof typeof CourseCategoryOrderByRelevanceFieldEnum];
export declare const CourseFAQOrderByRelevanceFieldEnum: {
    readonly question: "question";
    readonly answer: "answer";
};
export type CourseFAQOrderByRelevanceFieldEnum = (typeof CourseFAQOrderByRelevanceFieldEnum)[keyof typeof CourseFAQOrderByRelevanceFieldEnum];
export declare const CourseReviewOrderByRelevanceFieldEnum: {
    readonly studentName: "studentName";
    readonly studentAvatar: "studentAvatar";
    readonly content: "content";
};
export type CourseReviewOrderByRelevanceFieldEnum = (typeof CourseReviewOrderByRelevanceFieldEnum)[keyof typeof CourseReviewOrderByRelevanceFieldEnum];
export declare const ModuleOrderByRelevanceFieldEnum: {
    readonly title: "title";
    readonly description: "description";
    readonly duration: "duration";
};
export type ModuleOrderByRelevanceFieldEnum = (typeof ModuleOrderByRelevanceFieldEnum)[keyof typeof ModuleOrderByRelevanceFieldEnum];
export declare const LessonOrderByRelevanceFieldEnum: {
    readonly title: "title";
    readonly description: "description";
    readonly note: "note";
    readonly duration: "duration";
};
export type LessonOrderByRelevanceFieldEnum = (typeof LessonOrderByRelevanceFieldEnum)[keyof typeof LessonOrderByRelevanceFieldEnum];
export declare const ResourceOrderByRelevanceFieldEnum: {
    readonly publicId: "publicId";
    readonly fileType: "fileType";
    readonly fileUrl: "fileUrl";
};
export type ResourceOrderByRelevanceFieldEnum = (typeof ResourceOrderByRelevanceFieldEnum)[keyof typeof ResourceOrderByRelevanceFieldEnum];
export declare const EnrollmentOrderByRelevanceFieldEnum: {
    readonly status: "status";
};
export type EnrollmentOrderByRelevanceFieldEnum = (typeof EnrollmentOrderByRelevanceFieldEnum)[keyof typeof EnrollmentOrderByRelevanceFieldEnum];
export declare const QuizOrderByRelevanceFieldEnum: {
    readonly title: "title";
    readonly description: "description";
};
export type QuizOrderByRelevanceFieldEnum = (typeof QuizOrderByRelevanceFieldEnum)[keyof typeof QuizOrderByRelevanceFieldEnum];
export declare const QuestionOrderByRelevanceFieldEnum: {
    readonly question: "question";
    readonly type: "type";
    readonly correctAnswer: "correctAnswer";
};
export type QuestionOrderByRelevanceFieldEnum = (typeof QuestionOrderByRelevanceFieldEnum)[keyof typeof QuestionOrderByRelevanceFieldEnum];
export declare const OrderOrderByRelevanceFieldEnum: {
    readonly lecturer: "lecturer";
    readonly paymentMethod: "paymentMethod";
    readonly status: "status";
    readonly paymentLinkId: "paymentLinkId";
    readonly paymentStatus: "paymentStatus";
    readonly checkoutUrl: "checkoutUrl";
    readonly qrCode: "qrCode";
};
export type OrderOrderByRelevanceFieldEnum = (typeof OrderOrderByRelevanceFieldEnum)[keyof typeof OrderOrderByRelevanceFieldEnum];
export declare const CouponOrderByRelevanceFieldEnum: {
    readonly name: "name";
    readonly description: "description";
    readonly status: "status";
    readonly customerGroup: "customerGroup";
    readonly code: "code";
    readonly priority: "priority";
    readonly actions: "actions";
    readonly type: "type";
    readonly startingTime: "startingTime";
    readonly endingTime: "endingTime";
};
export type CouponOrderByRelevanceFieldEnum = (typeof CouponOrderByRelevanceFieldEnum)[keyof typeof CouponOrderByRelevanceFieldEnum];
export declare const CouponCategoryOrderByRelevanceFieldEnum: {
    readonly name: "name";
    readonly slug: "slug";
};
export type CouponCategoryOrderByRelevanceFieldEnum = (typeof CouponCategoryOrderByRelevanceFieldEnum)[keyof typeof CouponCategoryOrderByRelevanceFieldEnum];
export declare const SubmissionOrderByRelevanceFieldEnum: {
    readonly status: "status";
    readonly feedback: "feedback";
};
export type SubmissionOrderByRelevanceFieldEnum = (typeof SubmissionOrderByRelevanceFieldEnum)[keyof typeof SubmissionOrderByRelevanceFieldEnum];
export declare const AssessmentOrderByRelevanceFieldEnum: {
    readonly title: "title";
    readonly type: "type";
    readonly status: "status";
};
export type AssessmentOrderByRelevanceFieldEnum = (typeof AssessmentOrderByRelevanceFieldEnum)[keyof typeof AssessmentOrderByRelevanceFieldEnum];
export declare const BlogPostOrderByRelevanceFieldEnum: {
    readonly title: "title";
    readonly slug: "slug";
    readonly content: "content";
};
export type BlogPostOrderByRelevanceFieldEnum = (typeof BlogPostOrderByRelevanceFieldEnum)[keyof typeof BlogPostOrderByRelevanceFieldEnum];
export declare const BlogCategoryOrderByRelevanceFieldEnum: {
    readonly name: "name";
    readonly slug: "slug";
};
export type BlogCategoryOrderByRelevanceFieldEnum = (typeof BlogCategoryOrderByRelevanceFieldEnum)[keyof typeof BlogCategoryOrderByRelevanceFieldEnum];
export declare const BlogCommentOrderByRelevanceFieldEnum: {
    readonly content: "content";
};
export type BlogCommentOrderByRelevanceFieldEnum = (typeof BlogCommentOrderByRelevanceFieldEnum)[keyof typeof BlogCommentOrderByRelevanceFieldEnum];
export declare const WishlistOrderByRelevanceFieldEnum: {
    readonly courseThumbnail: "courseThumbnail";
    readonly courseName: "courseName";
    readonly lecturer: "lecturer";
};
export type WishlistOrderByRelevanceFieldEnum = (typeof WishlistOrderByRelevanceFieldEnum)[keyof typeof WishlistOrderByRelevanceFieldEnum];
export declare const CartOrderByRelevanceFieldEnum: {
    readonly courseName: "courseName";
    readonly lecturer: "lecturer";
};
export type CartOrderByRelevanceFieldEnum = (typeof CartOrderByRelevanceFieldEnum)[keyof typeof CartOrderByRelevanceFieldEnum];
export declare const TransactionOrderByRelevanceFieldEnum: {
    readonly userRole: "userRole";
    readonly paymentMethod: "paymentMethod";
    readonly status: "status";
    readonly gatewayReference: "gatewayReference";
};
export type TransactionOrderByRelevanceFieldEnum = (typeof TransactionOrderByRelevanceFieldEnum)[keyof typeof TransactionOrderByRelevanceFieldEnum];
export declare const TransactionStudentOrderByRelevanceFieldEnum: {
    readonly discountCode: "discountCode";
};
export type TransactionStudentOrderByRelevanceFieldEnum = (typeof TransactionStudentOrderByRelevanceFieldEnum)[keyof typeof TransactionStudentOrderByRelevanceFieldEnum];
export declare const LecturerProfileOrderByRelevanceFieldEnum: {
    readonly gender: "gender";
    readonly nationality: "nationality";
    readonly professionalTitle: "professionalTitle";
    readonly highestDegree: "highestDegree";
    readonly bio: "bio";
};
export type LecturerProfileOrderByRelevanceFieldEnum = (typeof LecturerProfileOrderByRelevanceFieldEnum)[keyof typeof LecturerProfileOrderByRelevanceFieldEnum];
export declare const LecturerPayoutOrderByRelevanceFieldEnum: {
    readonly currency: "currency";
    readonly payoutMethod: "payoutMethod";
    readonly status: "status";
};
export type LecturerPayoutOrderByRelevanceFieldEnum = (typeof LecturerPayoutOrderByRelevanceFieldEnum)[keyof typeof LecturerPayoutOrderByRelevanceFieldEnum];
export declare const LecturerPayoutAccountOrderByRelevanceFieldEnum: {
    readonly cardType: "cardType";
    readonly cardNumber: "cardNumber";
    readonly cardHolderName: "cardHolderName";
};
export type LecturerPayoutAccountOrderByRelevanceFieldEnum = (typeof LecturerPayoutAccountOrderByRelevanceFieldEnum)[keyof typeof LecturerPayoutAccountOrderByRelevanceFieldEnum];
export declare const NotificationOrderByRelevanceFieldEnum: {
    readonly title: "title";
    readonly message: "message";
    readonly type: "type";
};
export type NotificationOrderByRelevanceFieldEnum = (typeof NotificationOrderByRelevanceFieldEnum)[keyof typeof NotificationOrderByRelevanceFieldEnum];
export declare const ConversationOrderByRelevanceFieldEnum: {
    readonly lastMessageContent: "lastMessageContent";
};
export type ConversationOrderByRelevanceFieldEnum = (typeof ConversationOrderByRelevanceFieldEnum)[keyof typeof ConversationOrderByRelevanceFieldEnum];
export declare const MessageOrderByRelevanceFieldEnum: {
    readonly content: "content";
    readonly imgUrl: "imgUrl";
};
export type MessageOrderByRelevanceFieldEnum = (typeof MessageOrderByRelevanceFieldEnum)[keyof typeof MessageOrderByRelevanceFieldEnum];
//# sourceMappingURL=prismaNamespaceBrowser.d.ts.map