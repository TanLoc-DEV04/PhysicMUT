"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPassword = exports.changePassword = exports.register = exports.login = void 0;
const db_1 = __importDefault(require("../config/db"));
// Login
const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
    }
    try {
        // Find user
        const user = await db_1.default.user.findUnique({
            where: { username },
            include: { role: true }, // Include Role relation
        });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        // Check password (Simple comparison as per seed data, upgrade to bcrypt later)
        if (user.password_hash !== password) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        // Return user info sans password
        const { password_hash, ...userBuffer } = user;
        res.json({
            message: 'Login successful',
            user: userBuffer,
            // In a real app, generate a JWT token here
            token: 'mock-jwt-token-' + user.id
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.login = login;
// Register
const register = async (req, res) => {
    const { username, email, password, full_name } = req.body;
    if (!username || !email || !password) {
        res.status(400).json({ error: 'Username, email, and password are required' });
        return;
    }
    try {
        // Check if user exists
        const existingUser = await db_1.default.user.findFirst({
            where: {
                OR: [{ username }, { email }]
            }
        });
        if (existingUser) {
            res.status(400).json({ error: 'Username or email already exists' });
            return;
        }
        // Get Student Role
        const studentRole = await db_1.default.role.findUnique({
            where: { name: 'STUDENT' }
        });
        if (!studentRole) {
            res.status(500).json({ error: 'Default STUDENT role not found. Please seed the database.' });
            return;
        }
        // Create User
        const newUser = await db_1.default.user.create({
            data: {
                username,
                email,
                password_hash: password, // Store plain text for now matching seed
                full_name,
                role: { connect: { id: studentRole.id } }
            },
            include: { role: true }
        });
        const { password_hash, ...userBuffer } = newUser;
        res.status(201).json({
            message: 'User registered successfully',
            user: userBuffer
        });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.register = register;
// Change Password
const changePassword = async (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;
    if (!userId || !oldPassword || !newPassword) {
        res.status(400).json({ error: 'User ID, old password, and new password are required' });
        return;
    }
    try {
        const user = await db_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        if (user.password_hash !== oldPassword) {
            res.status(401).json({ error: 'Incorrect old password' });
            return;
        }
        await db_1.default.user.update({
            where: { id: userId },
            data: { password_hash: newPassword }
        });
        res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to change password' });
    }
};
exports.changePassword = changePassword;
// Forgot Password
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
    }
    try {
        const user = await db_1.default.user.findUnique({ where: { email } });
        if (!user) {
            // Do not reveal if email exists or not
            res.json({ message: 'If this email is registered, a password reset link has been sent.' });
            return;
        }
        // Mock sending email
        console.log(`Sending password reset email to ${email}`);
        res.json({ message: 'If this email is registered, a password reset link has been sent.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to process forgot password request' });
    }
};
exports.forgotPassword = forgotPassword;
//# sourceMappingURL=authController.js.map