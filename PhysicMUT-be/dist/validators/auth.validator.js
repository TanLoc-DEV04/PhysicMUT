"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPasswordSchema = exports.changePasswordSchema = exports.googleLoginSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        username: zod_1.z.string().min(1),
        password: zod_1.z.string().min(1),
    }),
});
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        username: zod_1.z.string().min(1),
        email: zod_1.z.string().email('Invalid email format'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        full_name: zod_1.z.string().optional(),
    }),
});
exports.googleLoginSchema = zod_1.z.object({
    body: zod_1.z.object({
        credential: zod_1.z.string().min(1),
    }),
});
exports.changePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        userId: zod_1.z.string().min(1),
        oldPassword: zod_1.z.string().min(1),
        newPassword: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    }),
});
exports.forgotPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email format'),
    }),
});
//# sourceMappingURL=auth.validator.js.map