import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(1),
    password: z.string().min(1),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(1),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    full_name: z.string().optional(),
  }),
});

export const googleLoginSchema = z.object({
  body: z.object({
    credential: z.string().min(1),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    userId: z.string().min(1),
    oldPassword: z.string().min(1),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
  }),
});
