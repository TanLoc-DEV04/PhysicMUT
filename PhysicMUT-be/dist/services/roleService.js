"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRole = exports.toggleRoleStatus = exports.updateRole = exports.createRole = exports.getRoleById = exports.getAdminRoles = exports.getRoles = void 0;
const db_1 = __importDefault(require("../config/db"));
const NON_ADMIN_ROLES = ['USER', 'STUDENT']; // STUDENT kept for legacy
const getRoles = async () => {
    return await db_1.default.role.findMany({ orderBy: { name: 'asc' } });
};
exports.getRoles = getRoles;
const getAdminRoles = async () => {
    return await db_1.default.role.findMany({
        where: {
            is_active: true,
            NOT: { name: { in: NON_ADMIN_ROLES } }
        },
        orderBy: { name: 'asc' }
    });
};
exports.getAdminRoles = getAdminRoles;
const getRoleById = async (id) => {
    return await db_1.default.role.findUnique({ where: { id } });
};
exports.getRoleById = getRoleById;
const createRole = async (data) => {
    return await db_1.default.role.create({
        data: {
            name: data.name,
            description: data.description,
            permissions: data.permissions,
            is_active: data.is_active !== undefined ? data.is_active : true
        }
    });
};
exports.createRole = createRole;
const updateRole = async (id, data) => {
    const updateData = { name: data.name, description: data.description, permissions: data.permissions };
    if (data.is_active !== undefined)
        updateData.is_active = data.is_active;
    return await db_1.default.role.update({
        where: { id },
        data: updateData
    });
};
exports.updateRole = updateRole;
const toggleRoleStatus = async (id, is_active) => {
    return await db_1.default.role.update({
        where: { id },
        data: { is_active }
    });
};
exports.toggleRoleStatus = toggleRoleStatus;
const deleteRole = async (id) => {
    // Check if role is assigned to any users
    const usersWithRole = await db_1.default.user.count({ where: { role_id: id } });
    if (usersWithRole > 0) {
        throw new Error(`Không thể xóa role này vì đang có ${usersWithRole} tài khoản đang sử dụng. Vui lòng chuyển các tài khoản đó sang role khác trước.`);
    }
    await db_1.default.role.delete({ where: { id } });
};
exports.deleteRole = deleteRole;
//# sourceMappingURL=roleService.js.map