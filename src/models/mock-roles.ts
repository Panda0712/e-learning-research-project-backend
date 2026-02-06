interface Role {
  id: number;
  name: string;
  permissions: string[];
  inherits: string[];
  createdAt: Date;
  updatedAt: Date;
  isDestroyed: boolean;
}

const mockRoles: Role[] = [];

export const MOCK_ROLES = {
  mockRoles,
};
