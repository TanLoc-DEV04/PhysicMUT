import { Request, Response } from 'express';
import * as roleService from '../services/roleService';

// Get all roles
export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await roleService.getRoles();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

// Get only admin-level active roles
export const getAdminRoles = async (req: Request, res: Response) => {
  try {
    const roles = await roleService.getAdminRoles();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin roles' });
  }
};

// Get role by ID
export const getRoleById = async (req: Request, res: Response) => {
  try {
    const role = await roleService.getRoleById(req.params.id as string);
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
    try {
        const role = await roleService.createRole(req.body);
        res.status(201).json(role);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create role' });
    }
};

// Update Role
export const updateRole = async (req: Request, res: Response) => {
    try {
        const role = await roleService.updateRole(req.params.id as string, req.body);
        res.json(role);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update role' });
    }
};

// Toggle Role active status
export const toggleRoleStatus = async (req: Request, res: Response) => {
    try {
        const role = await roleService.toggleRoleStatus(req.params.id as string, req.body.is_active);
        res.json(role);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update role status' });
    }
};

// Delete Role
export const deleteRole = async (req: Request, res: Response) => {
    try {
        await roleService.deleteRole(req.params.id as string);
        res.status(204).send();
    } catch (error: any) {
        if (error.message && error.message.includes('Cannot delete role')) {
            res.status(400).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: 'Failed to delete role' });
    }
};
