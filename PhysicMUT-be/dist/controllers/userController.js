"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserById = exports.createUser = exports.getUsers = void 0;
const db_1 = __importDefault(require("../config/db"));
// Get all users
const getUsers = async (req, res) => {
    try {
        const users = await db_1.default.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                full_name: true,
                role: true,
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
    const { username, email, password, full_name, role_name, role_id } = req.body;
    if (!username || !email || !password) {
        res.status(400).json({ error: 'Username, email, and password are required' });
        return;
    }
    try {
        let roleToConnect;
        if (role_id) {
            roleToConnect = { id: role_id };
        }
        else if (role_name) {
            const role = await db_1.default.role.findUnique({ where: { name: role_name } });
            if (role) {
                roleToConnect = { id: role.id };
            }
        }
        // Default to student if no role specified, or error? 
        // Admin creation should probably require role or default to Student.
        if (!roleToConnect) {
            const studentRole = await db_1.default.role.findUnique({ where: { name: 'STUDENT' } });
            if (studentRole)
                roleToConnect = { id: studentRole.id };
        }
        const newUser = await db_1.default.user.create({
            data: {
                username,
                email,
                password_hash: password, // Plain text as per seed
                full_name,
                role: roleToConnect ? { connect: roleToConnect } : undefined
            },
            select: {
                id: true,
                username: true,
                email: true,
                full_name: true,
                role: true,
                created_at: true,
            }
        });
        res.status(201).json(newUser);
    }
    catch (error) {
        console.error('Create user error:', error);
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
                role: true,
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
    const { full_name, role_id, role_name } = req.body;
    if (!id || typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    try {
        const updateData = { full_name };
        // Handle Role Update
        if (role_id) {
            updateData.role = { connect: { id: role_id } };
        }
        else if (role_name) {
            const role = await db_1.default.role.findUnique({ where: { name: role_name } });
            if (role) {
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
                role: true,
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
        await db_1.default.user.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=userController.js.map