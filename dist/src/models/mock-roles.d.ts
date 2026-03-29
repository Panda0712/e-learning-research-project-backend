interface Role {
    id: number;
    name: string;
    permissions: string[];
    inherits: string[];
    createdAt: Date;
    updatedAt: Date;
    isDestroyed?: boolean;
}
export declare const MOCK_ROLES: {
    mockRoles: Role[];
};
export {};
//# sourceMappingURL=mock-roles.d.ts.map