"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleIdSchema = exports.toggleRoleStatusSchema = exports.updateRoleSchema = exports.createRoleSchema = void 0;
const zod_1 = require("zod");
exports.createRoleSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Role name cannot be empty'),
        description: zod_1.z.string().optional(),
        permissions: zod_1.z.any().optional(),
        is_active: zod_1.z.boolean().optional(),
    }),
});
exports.updateRoleSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).optional(),
        description: zod_1.z.string().optional(),
        permissions: zod_1.z.any().optional(),
        is_active: zod_1.z.boolean().optional(),
    }),
});
exports.toggleRoleStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1),
    }),
    body: zod_1.z.object({
        is_active: zod_1.z.boolean(),
    }),
});
exports.roleIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1),
    }),
});
//# sourceMappingURL=role.validator.js.map