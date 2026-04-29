"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserStatus = exports.deleteUser = exports.updateUser = exports.getUserById = exports.createUser = exports.getUsers = void 0;
const db_1 = __importDefault(require("../config/db"));
const NON_ADMIN_ROLE_NAMES = ['USER', 'STUDENT'];
const getUsers = async (filters) => {
    const where = {};
    if (filters.roleId) {
        where.role_id = filters.roleId;
    }
    if (filters.search) {
        where.OR = [
            { username: { contains: filters.search, mode: 'insensitive' } },
            { email: { contains: filters.search, mode: 'insensitive' } },
            { full_name: { contains: filters.search, mode: 'insensitive' } },
        ];
    }
    return await db_1.default.user.findMany({
        where,
        select: {
            id: true,
            username: true,
            email: true,
            full_name: true,
            department: true,
            role: true,
            is_active: true,
            last_login: true,
            created_at: true,
        },
        orderBy: { created_at: 'desc' }
    });
};
exports.getUsers = getUsers;
const createUser = async (data) => {
    let resolvedRole = null;
    if (data.role_id) {
        resolvedRole = await db_1.default.role.findUnique({ where: { id: data.role_id } });
    }
    else if (data.role_name) {
        resolvedRole = await db_1.default.role.findUnique({ where: { name: data.role_name } });
    }
    if (resolvedRole && NON_ADMIN_ROLE_NAMES.includes(resolvedRole.name)) {
        throw new Error(`Dữ liệu không hợp lệ: Role "${resolvedRole.name}" không được phép gán cho tài khoản admin.`);
    }
    return await db_1.default.user.create({
        data: {
            username: data.username,
            email: data.email,
            password_hash: data.password, // Ideally hashed before service or in service
            full_name: data.full_name,
            department: data.department || null,
            is_active: data.is_active !== undefined ? data.is_active : true,
            role: resolvedRole ? { connect: { id: resolvedRole.id } } : undefined
        },
        select: {
            id: true,
            username: true,
            email: true,
            full_name: true,
            department: true,
            role: true,
            is_active: true,
            last_login: true,
            created_at: true,
        }
    });
};
exports.createUser = createUser;
const getUserById = async (id) => {
    return await db_1.default.user.findUnique({
        where: { id },
        select: {
            id: true,
            username: true,
            email: true,
            full_name: true,
            department: true,
            role: true,
            is_active: true,
            last_login: true,
            created_at: true,
        },
    });
};
exports.getUserById = getUserById;
const updateUser = async (id, data) => {
    const updateData = {};
    if (data.full_name !== undefined)
        updateData.full_name = data.full_name;
    if (data.department !== undefined)
        updateData.department = data.department;
    if (data.role_id) {
        const resolvedRole = await db_1.default.role.findUnique({ where: { id: data.role_id } });
        if (resolvedRole && NON_ADMIN_ROLE_NAMES.includes(resolvedRole.name)) {
            throw new Error(`Dữ liệu không hợp lệ: Role "${resolvedRole.name}" không được phép gán cho tài khoản admin.`);
        }
        updateData.role = { connect: { id: data.role_id } };
    }
    else if (data.role_name) {
        const role = await db_1.default.role.findUnique({ where: { name: data.role_name } });
        if (role) {
            if (NON_ADMIN_ROLE_NAMES.includes(role.name)) {
                throw new Error(`Dữ liệu không hợp lệ: Role "${role.name}" không được phép gán cho tài khoản admin.`);
            }
            updateData.role = { connect: { id: role.id } };
        }
    }
    return await db_1.default.user.update({
        where: { id },
        data: updateData,
        select: {
            id: true,
            username: true,
            email: true,
            full_name: true,
            department: true,
            role: true,
            is_active: true,
            last_login: true,
            created_at: true,
        },
    });
};
exports.updateUser = updateUser;
const deleteUser = async (id) => {
    return await db_1.default.user.delete({ where: { id } });
};
exports.deleteUser = deleteUser;
const updateUserStatus = async (id, is_active) => {
    return await db_1.default.user.update({
        where: { id },
        data: { is_active },
        select: {
            id: true,
            username: true,
            email: true,
            full_name: true,
            department: true,
            role: true,
            is_active: true,
        },
    });
};
exports.updateUserStatus = updateUserStatus;
//# sourceMappingURL=userService.js.map