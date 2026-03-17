interface Role {
  id: number;
  name: string;
  permissions: string[];
  inherits: string[];
  createdAt: Date;
  updatedAt: Date;
  isDestroyed?: boolean;
}

const mockRoles: Role[] = [
  // student
  {
    id: 1,
    name: "student",
    permissions: [
      "read_assessment",

      "create_blog",
      "read_blog",
      "update_blog",
      "delete_blog",

      "create_cart",
      "read_cart",
      "update_cart",
      "delete_cart",

      "create_conversation",
      "read_conversation",
      "update_conversation",

      "read_coupon",

      "read_course",

      "read_lesson",

      "create_message",
      "read_message",
      "update_message",
      "delete_message",

      "read_module",

      "create_order",
      "read_order",

      "read_question",

      "read_quiz",
    ],
    inherits: [], // client không kế thừa permissions từ role nào cả.
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // lecturer
  {
    id: 2,
    name: "lecturer",
    permissions: [
      "create_assessment",
      "update_assessment",
      "delete_assessment",

      "delete_conversation",

      "create_coupon",
      "update_coupon",
      "delete_coupon",

      "create_course",
      "update_course",
      "delete_course",

      "read_dashboard",

      "create_enrollment",
      "read_enrollment",
      "update_enrollment",
      "delete_enrollment",

      "create_lesson",
      "update_lesson",
      "delete_lesson",

      "create_module",
      "update_module",
      "delete_module",

      "update_order",

      "create_question",
      "update_question",
      "delete_question",

      "create_quiz",
      "update_quiz",
      "delete_quiz",

      "create_resource",
      "read_resource",
      "update_resource",

      "create_transaction",
      "read_transaction",
    ],
    inherits: ["student"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // admin
  {
    id: 3,
    name: "admin",
    permissions: [
      "create_dashboard",
      "update_dashboard",
      "delete_dashboard",

      "delete_order",

      "delete_resource",

      "update_transaction",
      "delete_transaction",
    ],
    inherits: ["student", "lecturer"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const MOCK_ROLES = {
  mockRoles,
};
