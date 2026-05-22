import prisma from '../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export const login = async (data: any) => {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: data.username },
          { email: data.username }
        ]
      },
      include: { role: true },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.is_active || !user.role || !user.role.is_active) {
      throw new Error('Your account or role has been disabled.');
    }

    let isMatch = false;
    if (user.password_hash.startsWith('$2b$') || user.password_hash.startsWith('$2a$')) {
        isMatch = await bcrypt.compare(data.password, user.password_hash);
    } else {
        isMatch = (user.password_hash === data.password);
    }

    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
        { userId: user.id, role: user.role.name },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    const { password_hash, ...userBuffer } = user;
    return { user: userBuffer, token };
};

export const register = async (data: any) => {
    const existingUser = await prisma.user.findFirst({
        where: { OR: [{ username: data.username }, { email: data.email }] }
    });

    if (existingUser) {
        throw new Error('Username or email already exists');
    }

    const userRole = await prisma.role.findUnique({ where: { name: 'USER' } });
    if (!userRole) {
        throw new Error('Default USER role not found.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const newUser = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password_hash: hashedPassword,
        full_name: data.full_name || data.username,
        role: { connect: { id: userRole.id } }
      },
      include: { role: true }
    });

    const token = jwt.sign(
        { userId: newUser.id, role: (newUser as any).role?.name || 'USER' },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    const { password_hash, ...userBuffer } = newUser;
    return { user: userBuffer, token };
};

export const googleLogin = async (credential: string) => {
    const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
        throw new Error('Invalid Google token');
    }

    const email = payload.email;
    const name = payload.name || 'Google User';

    let user = await prisma.user.findUnique({
        where: { email },
        include: { role: true }
    });

    if (!user) {
        const userRole = await prisma.role.findUnique({ where: { name: 'USER' } });
        if (!userRole) {
            throw new Error('Default USER role not found.');
        }

        const salt = await bcrypt.genSalt(10);
        const randomPassword = await bcrypt.hash(crypto.randomBytes(8).toString('hex'), salt);

        const baseUsername = email.split('@')[0];
        let username = baseUsername;
        let counter = 1;
        while (await prisma.user.findUnique({ where: { username } })) {
            username = `${baseUsername}${counter}`;
            counter++;
        }

        user = await prisma.user.create({
            data: {
                username: username as string,
                email: email as string,
                full_name: name as string,
                password_hash: randomPassword,
                role: { connect: { id: userRole.id } }
            },
            include: { role: true }
        }) as any;
    }

    if (!user || !(user as any).is_active || !(user as any).role?.is_active) {
        throw new Error('Your account or role has been disabled.');
    }

    const token = jwt.sign(
        { userId: (user as any).id, role: (user as any).role?.name || 'USER' },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    const { password_hash: p_h, ...userBuffer } = user as any;
    return { user: userBuffer, token };
};

export const changePassword = async (data: any) => {
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
        throw new Error('User not found');
    }
    let isMatch = false;
    if (user.password_hash.startsWith('$2b$') || user.password_hash.startsWith('$2a$')) {
        isMatch = await bcrypt.compare(data.oldPassword, user.password_hash);
    } else {
        isMatch = (user.password_hash === data.oldPassword);
    }

    if (!isMatch) {
        throw new Error('Incorrect old password');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(data.newPassword, salt);
    await prisma.user.update({
        where: { id: data.userId },
        data: { password_hash: hashedNewPassword }
    });
};
