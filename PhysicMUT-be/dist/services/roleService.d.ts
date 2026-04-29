export declare const getRoles: () => Promise<{
    name: string;
    id: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    description: string | null;
    permissions: import("@prisma/client/runtime/library").JsonValue | null;
}[]>;
export declare const getAdminRoles: () => Promise<{
    name: string;
    id: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    description: string | null;
    permissions: import("@prisma/client/runtime/library").JsonValue | null;
}[]>;
export declare const getRoleById: (id: string) => Promise<{
    name: string;
    id: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    description: string | null;
    permissions: import("@prisma/client/runtime/library").JsonValue | null;
} | null>;
export declare const createRole: (data: {
    name: string;
    description?: string;
    permissions?: any;
    is_active?: boolean;
}) => Promise<{
    name: string;
    id: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    description: string | null;
    permissions: import("@prisma/client/runtime/library").JsonValue | null;
}>;
export declare const updateRole: (id: string, data: {
    name?: string;
    description?: string;
    permissions?: any;
    is_active?: boolean;
}) => Promise<{
    name: string;
    id: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    description: string | null;
    permissions: import("@prisma/client/runtime/library").JsonValue | null;
}>;
export declare const toggleRoleStatus: (id: string, is_active: boolean) => Promise<{
    name: string;
    id: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    description: string | null;
    permissions: import("@prisma/client/runtime/library").JsonValue | null;
}>;
export declare const deleteRole: (id: string) => Promise<void>;
//# sourceMappingURL=roleService.d.ts.map