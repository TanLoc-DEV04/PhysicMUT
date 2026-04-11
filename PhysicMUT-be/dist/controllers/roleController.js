"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRole = exports.toggleRoleStatus = exports.updateRole = exports.createRole = exports.getRoleById = exports.getAdminRoles = exports.getRoles = void 0;
const db_1 = __importDefault(require("../config/db"));
// Non-admin role names (cannot be assigned to admin users)
const NON_ADMIN_ROLES = ['USER', 'STUDENT']; // STUDENT kept for legacy
// Get all roles
const getRoles = async (req, res) => {
    try {
        const roles = await db_1.default.role.findMany({ orderBy: { name: 'asc' } });
        res.json(roles);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch roles' });
    }
};
exports.getRoles = getRoles;
// Get only admin-level active roles (for Add Admin dropdown)
const getAdminRoles = async (req, res) => {
    try {
        const roles = await db_1.default.role.findMany({
            where: {
                is_active: true,
                NOT: { name: { in: NON_ADMIN_ROLES } }
            },
            orderBy: { name: 'asc' }
        });
        res.json(roles);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch admin roles' });
    }
};
exports.getAdminRoles = getAdminRoles;
// Get role by ID
const getRoleById = async (req, res) => {
    const { id } = req.params;
    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    try {
        const role = await db_1.default.role.findUnique({ where: { id } });
        if (!role) {
            res.status(404).json({ error: 'Role not found' });
            return;
        }
        res.json(role);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch role' });
    }
};
exports.getRoleById = getRoleById;
// Create Role
const createRole = async (req, res) => {
    const { name, description, permissions, is_active } = req.body;
    if (!name) {
        res.status(400).json({ error: 'Role name is required' });
        return;
    }
    try {
        const role = await db_1.default.role.create({
            data: {
                name,
                description,
                permissions,
                is_active: is_active !== undefined ? is_active : true
            }
        });
        res.status(201).json(role);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create role' });
    }
};
exports.createRole = createRole;
// Update Role
const updateRole = async (req, res) => {
    const { id } = req.params;
    const { name, description, permissions, is_active } = req.body;
    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    try {
        const updateData = { name, description, permissions };
        if (is_active !== undefined)
            updateData.is_active = is_active;
        const role = await db_1.default.role.update({
            where: { id },
            data: updateData
        });
        res.json(role);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update role' });
    }
};
exports.updateRole = updateRole;
// Toggle Role active status
const toggleRoleStatus = async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;
    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    if (typeof is_active !== 'boolean') {
        res.status(400).json({ error: 'is_active must be a boolean' });
        return;
    }
    try {
        const role = await db_1.default.role.update({
            where: { id },
            data: { is_active }
        });
        res.json(role);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update role status' });
    }
};
exports.toggleRoleStatus = toggleRoleStatus;
// Delete Role (with guard: cannot delete if users are assigned)
const deleteRole = async (req, res) => {
    const { id } = req.params;
    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    try {
        // Check if role is assigned to any users
        const usersWithRole = await db_1.default.user.count({ where: { role_id: id } });
        if (usersWithRole > 0) {
            res.status(400).json({
                error: `Không thể xóa role này vì đang có ${usersWithRole} tài khoản đang sử dụng. Vui lòng chuyển các tài khoản đó sang role khác trước.`
            });
            return;
        }
        await db_1.default.role.delete({ where: { id } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete role' });
    }
};
exports.deleteRole = deleteRole;
//# sourceMappingURL=roleController.js.map