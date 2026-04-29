import { z } from 'zod';

export const getUsersSchema = z.object({
  query: z.object({
    roleId: z.string().optional(),
    search: z.string().optional(),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    username: z.string().min(1),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    full_name: z.string().optional(),
    role_name: z.string().optional(),
    role_id: z.string().optional(),
    department: z.string().optional(),
    is_active: z.boolean().optional(),
  }),
});

export const userIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    full_name: z.string().optional(),
    role_id: z.string().optional(),
    role_name: z.string().optional(),
    department: z.string().optional(),
  }),
});

export const updateUserStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    is_active: z.boolean(),
  }),
});
