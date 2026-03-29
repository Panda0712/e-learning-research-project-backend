import * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "./prismaNamespace.js";
export type LogOptions<ClientOptions extends Prisma.PrismaClientOptions> = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never;
export interface PrismaClientConstructor {
    /**
   * ## Prisma Client
   *
   * Type-safe database client for TypeScript
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */
    new <Options extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions, LogOpts extends LogOptions<Options> = LogOptions<Options>, OmitOpts extends Prisma.PrismaClientOptions['omit'] = Options extends {
        omit: infer U;
    } ? U : Prisma.PrismaClientOptions['omit'], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs>(options: Prisma.Subset<Options, Prisma.PrismaClientOptions>): PrismaClient<LogOpts, OmitOpts, ExtArgs>;
}
/**
 * ## Prisma Client
 *
 * Type-safe database client for TypeScript
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export interface PrismaClient<in LogOpts extends Prisma.LogLevel = never, in out OmitOpts extends Prisma.PrismaClientOptions['omit'] = undefined, in out ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['other'];
    };
    $on<V extends LogOpts>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;
    /**
     * Connect with the database
     */
    $connect(): runtime.Types.Utils.JsPromise<void>;
    /**
     * Disconnect from the database
     */
    $disconnect(): runtime.Types.Utils.JsPromise<void>;
    /**
       * Executes a prepared raw query and returns the number of affected rows.
       * @example
       * ```
       * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
       * ```
       *
       * Read more in our [docs](https://pris.ly/d/raw-queries).
       */
    $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;
    /**
     * Executes a raw query and returns the number of affected rows.
     * Susceptible to SQL injections, see documentation.
     * @example
     * ```
     * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
     * ```
     *
     * Read more in our [docs](https://pris.ly/d/raw-queries).
     */
    $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;
    /**
     * Performs a prepared raw query and returns the `SELECT` data.
     * @example
     * ```
     * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
     * ```
     *
     * Read more in our [docs](https://pris.ly/d/raw-queries).
     */
    $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;
    /**
     * Performs a raw query and returns the `SELECT` data.
     * Susceptible to SQL injections, see documentation.
     * @example
     * ```
     * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
     * ```
     *
     * Read more in our [docs](https://pris.ly/d/raw-queries).
     */
    $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;
    /**
     * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
     * @example
     * ```
     * const [george, bob, alice] = await prisma.$transaction([
     *   prisma.user.create({ data: { name: 'George' } }),
     *   prisma.user.create({ data: { name: 'Bob' } }),
     *   prisma.user.create({ data: { name: 'Alice' } }),
     * ])
     * ```
     *
     * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
     */
    $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: {
        isolationLevel?: Prisma.TransactionIsolationLevel;
    }): runtime.Types.Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;
    $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => runtime.Types.Utils.JsPromise<R>, options?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: Prisma.TransactionIsolationLevel;
    }): runtime.Types.Utils.JsPromise<R>;
    $extends: runtime.Types.Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<OmitOpts>, ExtArgs, runtime.Types.Utils.Call<Prisma.TypeMapCb<OmitOpts>, {
        extArgs: ExtArgs;
    }>>;
    /**
 * `prisma.user`: Exposes CRUD operations for the **User** model.
  * Example usage:
  * ```ts
  * // Fetch zero or more Users
  * const users = await prisma.user.findMany()
  * ```
  */
    get user(): Prisma.UserDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.keyToken`: Exposes CRUD operations for the **KeyToken** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more KeyTokens
      * const keyTokens = await prisma.keyToken.findMany()
      * ```
      */
    get keyToken(): Prisma.KeyTokenDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.role`: Exposes CRUD operations for the **Role** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Roles
      * const roles = await prisma.role.findMany()
      * ```
      */
    get role(): Prisma.RoleDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.course`: Exposes CRUD operations for the **Course** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Courses
      * const courses = await prisma.course.findMany()
      * ```
      */
    get course(): Prisma.CourseDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.courseCategory`: Exposes CRUD operations for the **CourseCategory** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more CourseCategories
      * const courseCategories = await prisma.courseCategory.findMany()
      * ```
      */
    get courseCategory(): Prisma.CourseCategoryDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.courseFAQ`: Exposes CRUD operations for the **CourseFAQ** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more CourseFAQS
      * const courseFAQS = await prisma.courseFAQ.findMany()
      * ```
      */
    get courseFAQ(): Prisma.CourseFAQDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.courseReview`: Exposes CRUD operations for the **CourseReview** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more CourseReviews
      * const courseReviews = await prisma.courseReview.findMany()
      * ```
      */
    get courseReview(): Prisma.CourseReviewDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.module`: Exposes CRUD operations for the **Module** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Modules
      * const modules = await prisma.module.findMany()
      * ```
      */
    get module(): Prisma.ModuleDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.lesson`: Exposes CRUD operations for the **Lesson** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Lessons
      * const lessons = await prisma.lesson.findMany()
      * ```
      */
    get lesson(): Prisma.LessonDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.resource`: Exposes CRUD operations for the **Resource** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Resources
      * const resources = await prisma.resource.findMany()
      * ```
      */
    get resource(): Prisma.ResourceDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.enrollment`: Exposes CRUD operations for the **Enrollment** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Enrollments
      * const enrollments = await prisma.enrollment.findMany()
      * ```
      */
    get enrollment(): Prisma.EnrollmentDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.quiz`: Exposes CRUD operations for the **Quiz** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Quizzes
      * const quizzes = await prisma.quiz.findMany()
      * ```
      */
    get quiz(): Prisma.QuizDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.question`: Exposes CRUD operations for the **Question** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Questions
      * const questions = await prisma.question.findMany()
      * ```
      */
    get question(): Prisma.QuestionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.order`: Exposes CRUD operations for the **Order** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Orders
      * const orders = await prisma.order.findMany()
      * ```
      */
    get order(): Prisma.OrderDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.orderItem`: Exposes CRUD operations for the **OrderItem** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more OrderItems
      * const orderItems = await prisma.orderItem.findMany()
      * ```
      */
    get orderItem(): Prisma.OrderItemDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.coupon`: Exposes CRUD operations for the **Coupon** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Coupons
      * const coupons = await prisma.coupon.findMany()
      * ```
      */
    get coupon(): Prisma.CouponDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.couponCategory`: Exposes CRUD operations for the **CouponCategory** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more CouponCategories
      * const couponCategories = await prisma.couponCategory.findMany()
      * ```
      */
    get couponCategory(): Prisma.CouponCategoryDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.submission`: Exposes CRUD operations for the **Submission** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Submissions
      * const submissions = await prisma.submission.findMany()
      * ```
      */
    get submission(): Prisma.SubmissionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.assessment`: Exposes CRUD operations for the **Assessment** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Assessments
      * const assessments = await prisma.assessment.findMany()
      * ```
      */
    get assessment(): Prisma.AssessmentDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.blogPost`: Exposes CRUD operations for the **BlogPost** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more BlogPosts
      * const blogPosts = await prisma.blogPost.findMany()
      * ```
      */
    get blogPost(): Prisma.BlogPostDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.blogCategory`: Exposes CRUD operations for the **BlogCategory** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more BlogCategories
      * const blogCategories = await prisma.blogCategory.findMany()
      * ```
      */
    get blogCategory(): Prisma.BlogCategoryDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.blogComment`: Exposes CRUD operations for the **BlogComment** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more BlogComments
      * const blogComments = await prisma.blogComment.findMany()
      * ```
      */
    get blogComment(): Prisma.BlogCommentDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.wishlist`: Exposes CRUD operations for the **Wishlist** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Wishlists
      * const wishlists = await prisma.wishlist.findMany()
      * ```
      */
    get wishlist(): Prisma.WishlistDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.cart`: Exposes CRUD operations for the **Cart** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Carts
      * const carts = await prisma.cart.findMany()
      * ```
      */
    get cart(): Prisma.CartDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.cartItem`: Exposes CRUD operations for the **CartItem** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more CartItems
      * const cartItems = await prisma.cartItem.findMany()
      * ```
      */
    get cartItem(): Prisma.CartItemDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.transaction`: Exposes CRUD operations for the **Transaction** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Transactions
      * const transactions = await prisma.transaction.findMany()
      * ```
      */
    get transaction(): Prisma.TransactionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.transactionStudent`: Exposes CRUD operations for the **TransactionStudent** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more TransactionStudents
      * const transactionStudents = await prisma.transactionStudent.findMany()
      * ```
      */
    get transactionStudent(): Prisma.TransactionStudentDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.lecturerProfile`: Exposes CRUD operations for the **LecturerProfile** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more LecturerProfiles
      * const lecturerProfiles = await prisma.lecturerProfile.findMany()
      * ```
      */
    get lecturerProfile(): Prisma.LecturerProfileDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.lecturerPayout`: Exposes CRUD operations for the **LecturerPayout** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more LecturerPayouts
      * const lecturerPayouts = await prisma.lecturerPayout.findMany()
      * ```
      */
    get lecturerPayout(): Prisma.LecturerPayoutDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.lecturerPayoutAccount`: Exposes CRUD operations for the **LecturerPayoutAccount** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more LecturerPayoutAccounts
      * const lecturerPayoutAccounts = await prisma.lecturerPayoutAccount.findMany()
      * ```
      */
    get lecturerPayoutAccount(): Prisma.LecturerPayoutAccountDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.revenue`: Exposes CRUD operations for the **Revenue** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Revenues
      * const revenues = await prisma.revenue.findMany()
      * ```
      */
    get revenue(): Prisma.RevenueDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.notification`: Exposes CRUD operations for the **Notification** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Notifications
      * const notifications = await prisma.notification.findMany()
      * ```
      */
    get notification(): Prisma.NotificationDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.conversation`: Exposes CRUD operations for the **Conversation** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Conversations
      * const conversations = await prisma.conversation.findMany()
      * ```
      */
    get conversation(): Prisma.ConversationDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.conversationMember`: Exposes CRUD operations for the **ConversationMember** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more ConversationMembers
      * const conversationMembers = await prisma.conversationMember.findMany()
      * ```
      */
    get conversationMember(): Prisma.ConversationMemberDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.message`: Exposes CRUD operations for the **Message** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Messages
      * const messages = await prisma.message.findMany()
      * ```
      */
    get message(): Prisma.MessageDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
}
export declare function getPrismaClientClass(): PrismaClientConstructor;
//# sourceMappingURL=class.d.ts.map