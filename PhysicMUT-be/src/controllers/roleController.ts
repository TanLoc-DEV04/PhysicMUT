import { Request, Response } from 'express';
import prisma from '../config/db';

// Non-admin role names (cannot be assigned to admin users)
const NON_ADMIN_ROLES = ['USER', 'STUDENT']; // STUDENT kept for legacy

// Get all roles
export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany({ orderBy: { name: 'asc' } });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

// Get only admin-level active roles (for Add Admin dropdown)
export const getAdminRoles = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      where: {
        is_active: true,
        NOT: { name: { in: NON_ADMIN_ROLES } }
      },
      orderBy: { name: 'asc' }
    });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin roles' });
  }
};

// Get role by ID
export const getRoleById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (typeof id !== 'string') {
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }
  try {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
      res.status(404).json({ error: 'Role not found' });
      return;
    }
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch role' });
  }
};

// Create Role
export const createRole = async (req: Request, res: Response) => {
    const { name, description, permissions, is_active } = req.body;
    
    if (!name) {
        res.status(400).json({ error: 'Role name is required' });
        return;
    }

    try {
        const role = await prisma.role.create({
            data: {
                name,
                description,
                permissions,
                is_active: is_active !== undefined ? is_active : true
            }
        });
        res.status(201).json(role);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create role' });
    }
};

// Update Role
export const updateRole = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, permissions, is_active } = req.body;

    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }

    try {
        const updateData: any = { name, description, permissions };
        if (is_active !== undefined) updateData.is_active = is_active;

        const role = await prisma.role.update({
            where: { id },
            data: updateData
        });
        res.json(role);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update role' });
    }
};

// Toggle Role active status
export const toggleRoleStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    if (typeof is_active !== 'boolean') {
        res.status(400).json({ error: 'is_active must be a boolean' });
        return;
    }

    try {
        const role = await prisma.role.update({
            where: { id },
            data: { is_active }
        });
        res.json(role);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update role status' });
    }
};

// Delete Role (with guard: cannot delete if users are assigned)
export const deleteRole = async (req: Request, res: Response) => {
    const { id } = req.params;
  
    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }

    try {
        // Check if role is assigned to any users
        const usersWithRole = await prisma.user.count({ where: { role_id: id } });
        if (usersWithRole > 0) {
            res.status(400).json({
                error: `Không thể xóa role này vì đang có ${usersWithRole} tài khoản đang sử dụng. Vui lòng chuyển các tài khoản đó sang role khác trước.`
            });
            return;
        }

        await prisma.role.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete role' });
    }
};
