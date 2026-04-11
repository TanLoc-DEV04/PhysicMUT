"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPassword = exports.changePassword = exports.googleLogin = exports.register = exports.login = void 0;
const db_1 = __importDefault(require("../config/db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
// Login
const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
    }
    try {
        const user = await db_1.default.user.findUnique({
            where: { username },
            include: { role: true },
        });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        if (!user.is_active || !user.role || !user.role.is_active) {
            res.status(403).json({ error: 'Tài khoản hoặc quyền của bạn đã bị vô hiệu hóa.' });
            return;
        }
        let isMatch = false;
        if (user.password_hash.startsWith('$2b$') || user.password_hash.startsWith('$2a$')) {
            isMatch = await bcrypt_1.default.compare(password, user.password_hash);
        }
        else {
            isMatch = (user.password_hash === password);
        }
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role.name }, JWT_SECRET, { expiresIn: '24h' });
        const { password_hash, ...userBuffer } = user;
        res.json({ message: 'Login successful', user: userBuffer, token });
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
        const existingUser = await db_1.default.user.findFirst({
            where: { OR: [{ username }, { email }] }
        });
        if (existingUser) {
            res.status(400).json({ error: 'Username or email already exists' });
            return;
        }
        const userRole = await db_1.default.role.findUnique({ where: { name: 'USER' } });
        if (!userRole) {
            res.status(500).json({ error: 'Default USER role not found.' });
            return;
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        const newUser = await db_1.default.user.create({
            data: {
                username,
                email,
                password_hash: hashedPassword,
                full_name: full_name || username,
                role: { connect: { id: userRole.id } }
            },
            include: { role: true }
        });
        const token = jsonwebtoken_1.default.sign({ userId: newUser.id, role: newUser.role?.name || 'USER' }, JWT_SECRET, { expiresIn: '24h' });
        const { password_hash, ...userBuffer } = newUser;
        res.status(201).json({ message: 'User registered successfully', user: userBuffer, token });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.register = register;
// Google Login
const googleLogin = async (req, res) => {
    const { credential } = req.body;
    if (!credential) {
        res.status(400).json({ error: 'Google credential is required' });
        return;
    }
    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            res.status(400).json({ error: 'Invalid Google token' });
            return;
        }
        const email = payload.email;
        const name = payload.name || 'Người dùng Google';
        let user = await db_1.default.user.findUnique({
            where: { email },
            include: { role: true }
        });
        if (!user) {
            const userRole = await db_1.default.role.findUnique({ where: { name: 'USER' } });
            if (!userRole) {
                res.status(500).json({ error: 'Default USER role not found.' });
                return;
            }
            const salt = await bcrypt_1.default.genSalt(10);
            const randomPassword = await bcrypt_1.default.hash(Math.random().toString(36).slice(-10), salt);
            const baseUsername = email.split('@')[0];
            let username = baseUsername;
            let counter = 1;
            while (await db_1.default.user.findUnique({ where: { username } })) {
                username = `${baseUsername}${counter}`;
                counter++;
            }
            user = await db_1.default.user.create({
                data: {
                    username: username,
                    email: email,
                    full_name: name,
                    password_hash: randomPassword,
                    role: { connect: { id: userRole.id } }
                },
                include: { role: true }
            });
        }
        if (!user || !user.is_active || !user.role?.is_active) {
            res.status(403).json({ error: 'Tài khoản hoặc quyền đã bị vô hiệu.' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role?.name || 'USER' }, JWT_SECRET, { expiresIn: '24h' });
        const { password_hash: p_h, ...userBuffer } = user;
        res.json({ message: 'Google Login successful', user: userBuffer, token });
    }
    catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ error: 'Google authentication failed' });
    }
};
exports.googleLogin = googleLogin;
// Change Password
const changePassword = async (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;
    if (!userId || !oldPassword || !newPassword) {
        res.status(400).json({ error: 'Missing parameters' });
        return;
    }
    try {
        const user = await db_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        let isMatch = false;
        if (user.password_hash.startsWith('$2b$') || user.password_hash.startsWith('$2a$')) {
            isMatch = await bcrypt_1.default.compare(oldPassword, user.password_hash);
        }
        else {
            isMatch = (user.password_hash === oldPassword);
        }
        if (!isMatch) {
            res.status(401).json({ error: 'Incorrect old password' });
            return;
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedNewPassword = await bcrypt_1.default.hash(newPassword, salt);
        await db_1.default.user.update({
            where: { id: userId },
            data: { password_hash: hashedNewPassword }
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
        res.json({ message: 'If this email is registered, a password reset link has been sent.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to process forgot password request' });
    }
};
exports.forgotPassword = forgotPassword;
//# sourceMappingURL=authController.js.map