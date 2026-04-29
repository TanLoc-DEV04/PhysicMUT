export declare const getUsers: (filters: {
    roleId?: string;
    search?: string;
}) => Promise<{
    id: string;
    username: string;
    email: string;
    full_name: string | null;
    department: string | null;
    is_active: boolean;
    last_login: Date | null;
    created_at: Date;
    role: {
        name: string;
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        permissions: import("@prisma/client/runtime/library").JsonValue | null;
    } | null;
}[]>;
export declare const createUser: (data: any) => Promise<{
    id: string;
    username: string;
    email: string;
    full_name: string | null;
    department: string | null;
    is_active: boolean;
    last_login: Date | null;
    created_at: Date;
    role: {
        name: string;
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        permissions: import("@prisma/client/runtime/library").JsonValue | null;
    } | null;
}>;
export declare const getUserById: (id: string) => Promise<{
    id: string;
    username: string;
    email: string;
    full_name: string | null;
    department: string | null;
    is_active: boolean;
    last_login: Date | null;
    created_at: Date;
    role: {
        name: string;
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        permissions: import("@prisma/client/runtime/library").JsonValue | null;
    } | null;
} | null>;
export declare const updateUser: (id: string, data: any) => Promise<{
    id: string;
    username: string;
    email: string;
    full_name: string | null;
    department: string | null;
    is_active: boolean;
    last_login: Date | null;
    created_at: Date;
    role: {
        name: string;
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        permissions: import("@prisma/client/runtime/library").JsonValue | null;
    } | null;
}>;
export declare const deleteUser: (id: string) => Promise<{
    id: string;
    username: string;
    email: string;
    password_hash: string;
    full_name: string | null;
    role_id: string | null;
    department: string | null;
    is_active: boolean;
    last_login: Date | null;
    created_at: Date;
    updated_at: Date;
}>;
export declare const updateUserStatus: (id: string, is_active: boolean) => Promise<{
    id: string;
    username: string;
    email: string;
    full_name: string | null;
    department: string | null;
    is_active: boolean;
    role: {
        name: string;
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        permissions: import("@prisma/client/runtime/library").JsonValue | null;
    } | null;
}>;
//# sourceMappingURL=userService.d.ts.map