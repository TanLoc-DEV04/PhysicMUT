import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    body: z.ZodObject<{
        username: z.ZodString;
        password: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const registerSchema: z.ZodObject<{
    body: z.ZodObject<{
        username: z.ZodString;
        email: z.ZodString;
        password: z.ZodString;
        full_name: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const googleLoginSchema: z.ZodObject<{
    body: z.ZodObject<{
        credential: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const changePasswordSchema: z.ZodObject<{
    body: z.ZodObject<{
        userId: z.ZodString;
        oldPassword: z.ZodString;
        newPassword: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const forgotPasswordSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=auth.validator.d.ts.map