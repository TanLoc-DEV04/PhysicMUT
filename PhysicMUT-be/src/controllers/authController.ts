import { Request, Response } from 'express';
import * as authService from '../services/authService';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.login(req.body);
    res.json({ message: 'Login successful', ...result });
  } catch (error: any) {
    if (error.message === 'Invalid credentials') {
        res.status(401).json({ error: error.message });
    } else if (error.message === 'Your account or role has been disabled.') {
        res.status(403).json({ error: error.message });
    } else {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ message: 'User registered successfully', ...result });
  } catch (error: any) {
    if (error.message === 'Username or email already exists') {
        res.status(400).json({ error: error.message });
    } else {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await authService.googleLogin(req.body.credential);
        res.json({ message: 'Google Login successful', ...result });
    } catch (error: any) {
        if (error.message === 'Invalid Google token' || error.message.includes('disabled')) {
            res.status(error.message.includes('disabled') ? 403 : 400).json({ error: error.message });
        } else {
            console.error('Google login error:', error);
            res.status(500).json({ error: 'Google authentication failed' });
        }
    }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        await authService.changePassword(req.body);
        res.json({ message: 'Password changed successfully' });
    } catch (error: any) {
        if (error.message === 'Incorrect old password') {
            res.status(401).json({ error: error.message });
        } else if (error.message === 'User not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Failed to change password' });
        }
    }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        // Logic handled in service? Right now just a placeholder return
        res.json({ message: 'If this email is registered, a password reset link has been sent.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process forgot password request' });
    }
};
