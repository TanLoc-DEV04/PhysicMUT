import { Request, Response } from 'express';
import prisma from '../config/db';

// Get all roles
export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roles' });
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
    const role = await prisma.role.findUnique({
      where: { id },
    });
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
    const { name, description, permissions } = req.body;
    
    if (!name) {
        res.status(400).json({ error: 'Role name is required' });
        return;
    }

    try {
        const role = await prisma.role.create({
            data: { name, description, permissions }
        });
        res.status(201).json(role);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create role' });
    }
}

// Update Role
export const updateRole = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }

    try {
        const role = await prisma.role.update({
            where: { id },
            data: { name, description, permissions }
        });
        res.json(role);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update role' });
    }
}


// Delete Role
export const deleteRole = async (req: Request, res: Response) => {
    const { id } = req.params;
  
    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }

    try {
      await prisma.role.delete({
        where: { id },
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete role' });
    }
};
