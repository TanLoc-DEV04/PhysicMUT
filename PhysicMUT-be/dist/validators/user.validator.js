"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserStatusSchema = exports.updateUserSchema = exports.userIdSchema = exports.createUserSchema = exports.getUsersSchema = void 0;
const zod_1 = require("zod");
exports.getUsersSchema = zod_1.z.object({
    query: zod_1.z.object({
        roleId: zod_1.z.string().optional(),
        search: zod_1.z.string().optional(),
    }),
});
exports.createUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        username: zod_1.z.string().min(1),
        email: zod_1.z.string().email('Invalid email'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
        full_name: zod_1.z.string().optional(),
        role_name: zod_1.z.string().optional(),
        role_id: zod_1.z.string().optional(),
        department: zod_1.z.string().optional(),
        is_active: zod_1.z.boolean().optional(),
    }),
});
exports.userIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1),
    }),
});
exports.updateUserSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1),
    }),
    body: zod_1.z.object({
        full_name: zod_1.z.string().optional(),
        role_id: zod_1.z.string().optional(),
        role_name: zod_1.z.string().optional(),
        department: zod_1.z.string().optional(),
    }),
});
exports.updateUserStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1),
    }),
    body: zod_1.z.object({
        is_active: zod_1.z.boolean(),
    }),
});
//# sourceMappingURL=user.validator.js.map