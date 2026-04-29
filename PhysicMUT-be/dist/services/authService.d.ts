export declare const login: (data: any) => Promise<{
    user: {
        role: {
            name: string;
            id: string;
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            description: string | null;
            permissions: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
        id: string;
        username: string;
        email: string;
        full_name: string | null;
        role_id: string | null;
        department: string | null;
        is_active: boolean;
        last_login: Date | null;
        created_at: Date;
        updated_at: Date;
    };
    token: string;
}>;
export declare const register: (data: any) => Promise<{
    user: {
        role: {
            name: string;
            id: string;
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            description: string | null;
            permissions: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
        id: string;
        username: string;
        email: string;
        full_name: string | null;
        role_id: string | null;
        department: string | null;
        is_active: boolean;
        last_login: Date | null;
        created_at: Date;
        updated_at: Date;
    };
    token: string;
}>;
export declare const googleLogin: (credential: string) => Promise<{
    user: any;
    token: string;
}>;
export declare const changePassword: (data: any) => Promise<void>;
//# sourceMappingURL=authService.d.ts.map