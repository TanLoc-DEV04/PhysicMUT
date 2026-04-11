"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserStatus = exports.deleteUser = exports.updateUser = exports.getUserById = exports.createUser = exports.getUsers = void 0;
const db_1 = __importDefault(require("../config/db"));
// List of role names that are NOT allowed to be assigned to admin users
const NON_ADMIN_ROLE_NAMES = ['USER', 'STUDENT'];
// Get all users
const getUsers = async (req, res) => {
    try {
        const users = await db_1.default.user.findMany({
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
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};
exports.getUsers = getUsers;
// Create User (Admin only)
const createUser = async (req, res) => {
    const { username, email, password, full_name, role_name, role_id, department, is_active } = req.body;
    if (!username || !email || !password) {
        res.status(400).json({ error: 'Username, email và password là bắt buộc' });
        return;
    }
    if (password.length < 6) {
        res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
        return;
    }
    try {
        let resolvedRole = null;
        if (role_id) {
            resolvedRole = await db_1.default.role.findUnique({ where: { id: role_id } });
        }
        else if (role_name) {
            resolvedRole = await db_1.default.role.findUnique({ where: { name: role_name } });
        }
        // Validate: admin creation must use an admin-level role
        if (resolvedRole && NON_ADMIN_ROLE_NAMES.includes(resolvedRole.name)) {
            res.status(400).json({
                error: `Dữ liệu không hợp lệ: Role "${resolvedRole.name}" không được phép gán cho tài khoản admin.`
            });
            return;
        }
        const newUser = await db_1.default.user.create({
            data: {
                username,
                email,
                password_hash: password,
                full_name,
                department: department || null,
                is_active: is_active !== undefined ? is_active : true,
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
        res.status(201).json(newUser);
    }
    catch (error) {
        console.error('Create user error:', error);
        if (error.code === 'P2002') {
            const field = error.meta?.target?.includes('email') ? 'Email' : 'Username';
            res.status(400).json({ error: `${field} đã tồn tại trong hệ thống` });
            return;
        }
        res.status(500).json({ error: 'Failed to create user' });
    }
};
exports.createUser = createUser;
// Get user by ID
const getUserById = async (req, res) => {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    try {
        const user = await db_1.default.user.findUnique({
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
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};
exports.getUserById = getUserById;
// Update user
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { full_name, role_id, role_name, department } = req.body;
    if (!id || typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    try {
        const updateData = {};
        if (full_name !== undefined)
            updateData.full_name = full_name;
        if (department !== undefined)
            updateData.department = department;
        // Handle Role Update
        if (role_id) {
            const resolvedRole = await db_1.default.role.findUnique({ where: { id: role_id } });
            if (resolvedRole && NON_ADMIN_ROLE_NAMES.includes(resolvedRole.name)) {
                res.status(400).json({
                    error: `Dữ liệu không hợp lệ: Role "${resolvedRole.name}" không được phép gán cho tài khoản admin.`
                });
                return;
            }
            updateData.role = { connect: { id: role_id } };
        }
        else if (role_name) {
            const role = await db_1.default.role.findUnique({ where: { name: role_name } });
            if (role) {
                if (NON_ADMIN_ROLE_NAMES.includes(role.name)) {
                    res.status(400).json({
                        error: `Dữ liệu không hợp lệ: Role "${role.name}" không được phép gán cho tài khoản admin.`
                    });
                    return;
                }
                updateData.role = { connect: { id: role.id } };
            }
        }
        const user = await db_1.default.user.update({
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
        res.json(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};
exports.updateUser = updateUser;
// Delete user
const deleteUser = async (req, res) => {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    try {
        await db_1.default.user.delete({ where: { id } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
exports.deleteUser = deleteUser;
// Toggle user active/inactive status
const updateUserStatus = async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;
    if (!id || typeof id !== 'string' || typeof is_active !== 'boolean') {
        res.status(400).json({ error: 'Invalid ID or is_active value (must be boolean)' });
        return;
    }
    try {
        const user = await db_1.default.user.update({
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
        res.json(user);
    }
    catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ error: 'Failed to update user status' });
    }
};
exports.updateUserStatus = updateUserStatus;
//# sourceMappingURL=userController.js.map