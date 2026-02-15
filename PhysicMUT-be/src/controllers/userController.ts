import { Request, Response } from 'express';
import prisma from '../config/db';

// Get all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        full_name: true,
        role: true,
        created_at: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Create User (Admin only)
export const createUser = async (req: Request, res: Response) => {
    const { username, email, password, full_name, role_name, role_id } = req.body;

    if (!username || !email || !password) {
        res.status(400).json({ error: 'Username, email, and password are required' });
        return;
    }

    try {
        let roleToConnect;
        
        if (role_id) {
            roleToConnect = { id: role_id };
        } else if (role_name) {
            const role = await prisma.role.findUnique({ where: { name: role_name } });
            if (role) {
                roleToConnect = { id: role.id };
            }
        }

        // Default to student if no role specified, or error? 
        // Admin creation should probably require role or default to Student.
        if (!roleToConnect) {
             const studentRole = await prisma.role.findUnique({ where: { name: 'STUDENT' } });
             if (studentRole) roleToConnect = { id: studentRole.id };
        }

        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password_hash: password, // Plain text as per seed
                full_name,
                role: roleToConnect ? { connect: roleToConnect } : undefined
            },
            select: {
                id: true,
                username: true,
                email: true,
                full_name: true,
                role: true,
                created_at: true,
            }
        });
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
}

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
        role: true,
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
  const { full_name, role_id, role_name } = req.body;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }

  try {
    const updateData: any = { full_name };

    // Handle Role Update
    if (role_id) {
        updateData.role = { connect: { id: role_id } };
    } else if (role_name) {
        const role = await prisma.role.findUnique({ where: { name: role_name } });
        if (role) {
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
        role: true,
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
    await prisma.user.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
