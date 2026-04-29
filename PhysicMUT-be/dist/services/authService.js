"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.googleLogin = exports.register = exports.login = void 0;
const db_1 = __importDefault(require("../config/db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const login = async (data) => {
    const user = await db_1.default.user.findUnique({
        where: { username: data.username },
        include: { role: true },
    });
    if (!user) {
        throw new Error('Invalid credentials');
    }
    if (!user.is_active || !user.role || !user.role.is_active) {
        throw new Error('Tài khoản hoặc quyền của bạn đã bị vô hiệu hóa.');
    }
    let isMatch = false;
    if (user.password_hash.startsWith('$2b$') || user.password_hash.startsWith('$2a$')) {
        isMatch = await bcrypt_1.default.compare(data.password, user.password_hash);
    }
    else {
        isMatch = (user.password_hash === data.password);
    }
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role.name }, JWT_SECRET, { expiresIn: '24h' });
    const { password_hash, ...userBuffer } = user;
    return { user: userBuffer, token };
};
exports.login = login;
const register = async (data) => {
    const existingUser = await db_1.default.user.findFirst({
        where: { OR: [{ username: data.username }, { email: data.email }] }
    });
    if (existingUser) {
        throw new Error('Username or email already exists');
    }
    const userRole = await db_1.default.role.findUnique({ where: { name: 'USER' } });
    if (!userRole) {
        throw new Error('Default USER role not found.');
    }
    const salt = await bcrypt_1.default.genSalt(10);
    const hashedPassword = await bcrypt_1.default.hash(data.password, salt);
    const newUser = await db_1.default.user.create({
        data: {
            username: data.username,
            email: data.email,
            password_hash: hashedPassword,
            full_name: data.full_name || data.username,
            role: { connect: { id: userRole.id } }
        },
        include: { role: true }
    });
    const token = jsonwebtoken_1.default.sign({ userId: newUser.id, role: newUser.role?.name || 'USER' }, JWT_SECRET, { expiresIn: '24h' });
    const { password_hash, ...userBuffer } = newUser;
    return { user: userBuffer, token };
};
exports.register = register;
const googleLogin = async (credential) => {
    const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
        throw new Error('Invalid Google token');
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
            throw new Error('Default USER role not found.');
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
        throw new Error('Tài khoản hoặc quyền đã bị vô hiệu.');
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role?.name || 'USER' }, JWT_SECRET, { expiresIn: '24h' });
    const { password_hash: p_h, ...userBuffer } = user;
    return { user: userBuffer, token };
};
exports.googleLogin = googleLogin;
const changePassword = async (data) => {
    const user = await db_1.default.user.findUnique({ where: { id: data.userId } });
    if (!user) {
        throw new Error('User not found');
    }
    let isMatch = false;
    if (user.password_hash.startsWith('$2b$') || user.password_hash.startsWith('$2a$')) {
        isMatch = await bcrypt_1.default.compare(data.oldPassword, user.password_hash);
    }
    else {
        isMatch = (user.password_hash === data.oldPassword);
    }
    if (!isMatch) {
        throw new Error('Incorrect old password');
    }
    const salt = await bcrypt_1.default.genSalt(10);
    const hashedNewPassword = await bcrypt_1.default.hash(data.newPassword, salt);
    await db_1.default.user.update({
        where: { id: data.userId },
        data: { password_hash: hashedNewPassword }
    });
};
exports.changePassword = changePassword;
//# sourceMappingURL=authService.js.map