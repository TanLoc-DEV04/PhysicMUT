import { z } from 'zod';
export declare const getUsersSchema: z.ZodObject<{
    query: z.ZodObject<{
        roleId: z.ZodOptional<z.ZodString>;
        search: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const createUserSchema: z.ZodObject<{
    body: z.ZodObject<{
        username: z.ZodString;
        email: z.ZodString;
        password: z.ZodString;
        full_name: z.ZodOptional<z.ZodString>;
        role_name: z.ZodOptional<z.ZodString>;
        role_id: z.ZodOptional<z.ZodString>;
        department: z.ZodOptional<z.ZodString>;
        is_active: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const userIdSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateUserSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        full_name: z.ZodOptional<z.ZodString>;
        role_id: z.ZodOptional<z.ZodString>;
        role_name: z.ZodOptional<z.ZodString>;
        department: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateUserStatusSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        is_active: z.ZodBoolean;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=user.validator.d.ts.map