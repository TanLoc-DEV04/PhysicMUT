import { Request, Response } from 'express';
import * as userService from '../services/userService';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getUsers({
        roleId: req.query.roleId as string,
        search: req.query.search as string
    });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const newUser = await userService.createUser(req.body);
        res.status(201).json(newUser);
    } catch (error: any) {
        console.error('Create user error:', error);
        
        if (error.code === 'P2002') {
            const field = error.meta?.target?.includes('email') ? 'Email' : 'Username';
            res.status(400).json({ error: `${field} already exists in the system` });
            return;
        }

        if (error.message && error.message.includes('Invalid data')) {
            res.status(400).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: 'Failed to create user' });
    }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(req.params.id as string);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.updateUser(req.params.id as string, req.body);
    res.json(user);
  } catch (error: any) {
    console.error(error);
    if (error.message && error.message.includes('Invalid data')) {
        res.status(400).json({ error: error.message });
        return;
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await userService.deleteUser(req.params.id as string);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const user = await userService.updateUserStatus(req.params.id as string, req.body.is_active);
    res.json(user);
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};
