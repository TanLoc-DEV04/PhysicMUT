import { z } from 'zod';
export declare const createRoleSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        permissions: z.ZodOptional<z.ZodAny>;
        is_active: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateRoleSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        permissions: z.ZodOptional<z.ZodAny>;
        is_active: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const toggleRoleStatusSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        is_active: z.ZodBoolean;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const roleIdSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=role.validator.d.ts.map