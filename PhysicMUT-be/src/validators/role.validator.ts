import { z } from 'zod';

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Role name cannot be empty'),
    description: z.string().optional(),
    permissions: z.any().optional(),
    is_active: z.boolean().optional(),
  }),
});

export const updateRoleSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    permissions: z.any().optional(),
    is_active: z.boolean().optional(),
  }),
});

export const toggleRoleStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    is_active: z.boolean(),
  }),
});

export const roleIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});
