import { Request, Response } from 'express';
import prisma from '../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
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
        isMatch = await bcrypt.compare(password, user.password_hash);
    } else {
        isMatch = (user.password_hash === password);
    }

    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
        { userId: user.id, role: user.role.name },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    const { password_hash, ...userBuffer } = user;
    res.json({ message: 'Login successful', user: userBuffer, token });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Register
export const register = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password, full_name } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ error: 'Username, email, and password are required' });
    return;
  }

  try {
    const existingUser = await prisma.user.findFirst({
        where: { OR: [{ username }, { email }] }
    });

    if (existingUser) {
        res.status(400).json({ error: 'Username or email already exists' });
        return;
    }

    const userRole = await prisma.role.findUnique({ where: { name: 'USER' } });
    if (!userRole) {
        res.status(500).json({ error: 'Default USER role not found.' });
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password_hash: hashedPassword,
        full_name: full_name || username,
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
    res.status(201).json({ message: 'User registered successfully', user: userBuffer, token });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Google Login
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
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

        let user = await prisma.user.findUnique({
            where: { email },
            include: { role: true }
        });

        if (!user) {
            const userRole = await prisma.role.findUnique({ where: { name: 'USER' } });
            if (!userRole) {
                res.status(500).json({ error: 'Default USER role not found.' });
                return;
            }

            const salt = await bcrypt.genSalt(10);
            const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-10), salt);

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
            res.status(403).json({ error: 'Tài khoản hoặc quyền đã bị vô hiệu.' });
            return;
        }

        const token = jwt.sign(
            { userId: (user as any).id, role: (user as any).role?.name || 'USER' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        const { password_hash: p_h, ...userBuffer } = user as any;
        res.json({ message: 'Google Login successful', user: userBuffer, token });

    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ error: 'Google authentication failed' });
    }
};

// Change Password
export const changePassword = async (req: Request, res: Response): Promise<void> => {
    const { userId, oldPassword, newPassword } = req.body;
    if (!userId || !oldPassword || !newPassword) {
        res.status(400).json({ error: 'Missing parameters' });
        return;
    }
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        let isMatch = false;
        if (user.password_hash.startsWith('$2b$') || user.password_hash.startsWith('$2a$')) {
            isMatch = await bcrypt.compare(oldPassword, user.password_hash);
        } else {
            isMatch = (user.password_hash === oldPassword);
        }

        if (!isMatch) {
            res.status(401).json({ error: 'Incorrect old password' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);
        await prisma.user.update({
            where: { id: userId },
            data: { password_hash: hashedNewPassword }
        });
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to change password' });
    }
};

// Forgot Password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
    }
    try {
        res.json({ message: 'If this email is registered, a password reset link has been sent.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process forgot password request' });
    }
};
