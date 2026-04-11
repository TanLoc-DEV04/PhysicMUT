import { Request, Response } from 'express';
import prisma from '../config/db';

// List of role names that are NOT allowed to be assigned to admin users
const NON_ADMIN_ROLE_NAMES = ['USER', 'STUDENT'];

// Get all users
export const getUsers = async (req: Request, res: Response) => {
  const { roleId, search } = req.query;
  try {
    const where: any = {};
    if (roleId && typeof roleId === 'string') {
        where.role_id = roleId;
    }
    if (search && typeof search === 'string') {
        where.OR = [
            { username: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { full_name: { contains: search, mode: 'insensitive' } },
        ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        full_name: true,
        department: true,
        role: true,
        is_active: true,
        last_login: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Create User (Admin only)
export const createUser = async (req: Request, res: Response) => {
    const { username, email, password, full_name, role_name, role_id, department, is_active } = req.body;

    if (!username || !email || !password) {
        res.status(400).json({ error: 'Username, email và password là bắt buộc' });
        return;
    }
    if (password.length < 6) {
        res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
        return;
    }

    try {
        let resolvedRole: any = null;
        
        if (role_id) {
            resolvedRole = await prisma.role.findUnique({ where: { id: role_id } });
        } else if (role_name) {
            resolvedRole = await prisma.role.findUnique({ where: { name: role_name } });
        }

        // Validate: admin creation must use an admin-level role
        if (resolvedRole && NON_ADMIN_ROLE_NAMES.includes(resolvedRole.name)) {
            res.status(400).json({
                error: `Dữ liệu không hợp lệ: Role "${resolvedRole.name}" không được phép gán cho tài khoản admin.`
            });
            return;
        }

        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password_hash: password,
                full_name,
                department: department || null,
                is_active: is_active !== undefined ? is_active : true,
                role: resolvedRole ? { connect: { id: resolvedRole.id } } : undefined
            },
            select: {
                id: true,
                username: true,
                email: true,
                full_name: true,
                department: true,
                role: true,
                is_active: true,
                last_login: true,
                created_at: true,
            }
        });
        res.status(201).json(newUser);
    } catch (error: any) {
        console.error('Create user error:', error);
        if (error.code === 'P2002') {
            const field = error.meta?.target?.includes('email') ? 'Email' : 'Username';
            res.status(400).json({ error: `${field} đã tồn tại trong hệ thống` });
            return;
        }
        res.status(500).json({ error: 'Failed to create user' });
    }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        full_name: true,
        department: true,
        role: true,
        is_active: true,
        last_login: true,
        created_at: true,
      },
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { full_name, role_id, role_name, department } = req.body;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }

  try {
    const updateData: any = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (department !== undefined) updateData.department = department;

    // Handle Role Update
    if (role_id) {
        const resolvedRole = await prisma.role.findUnique({ where: { id: role_id } });
        if (resolvedRole && NON_ADMIN_ROLE_NAMES.includes(resolvedRole.name)) {
            res.status(400).json({
                error: `Dữ liệu không hợp lệ: Role "${resolvedRole.name}" không được phép gán cho tài khoản admin.`
            });
            return;
        }
        updateData.role = { connect: { id: role_id } };
    } else if (role_name) {
        const role = await prisma.role.findUnique({ where: { name: role_name } });
        if (role) {
            if (NON_ADMIN_ROLE_NAMES.includes(role.name)) {
                res.status(400).json({
                    error: `Dữ liệu không hợp lệ: Role "${role.name}" không được phép gán cho tài khoản admin.`
                });
                return;
            }
            updateData.role = { connect: { id: role.id } };
        }
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        full_name: true,
        department: true,
        role: true,
        is_active: true,
        last_login: true,
        created_at: true,
      },
    });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }
  try {
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Toggle user active/inactive status
export const updateUserStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { is_active } = req.body;

  if (!id || typeof id !== 'string' || typeof is_active !== 'boolean') {
    res.status(400).json({ error: 'Invalid ID or is_active value (must be boolean)' });
    return;
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { is_active },
      select: {
        id: true,
        username: true,
        email: true,
        full_name: true,
        department: true,
        role: true,
        is_active: true,
      },
    });
    res.json(user);
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};
