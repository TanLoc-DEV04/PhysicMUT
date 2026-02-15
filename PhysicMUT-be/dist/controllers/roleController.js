"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRole = exports.updateRole = exports.createRole = exports.getRoleById = exports.getRoles = void 0;
const db_1 = __importDefault(require("../config/db"));
// Get all roles
const getRoles = async (req, res) => {
    try {
        const roles = await db_1.default.role.findMany();
        res.json(roles);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch roles' });
    }
};
exports.getRoles = getRoles;
// Get role by ID
const getRoleById = async (req, res) => {
    const { id } = req.params;
    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    try {
        const role = await db_1.default.role.findUnique({
            where: { id },
        });
        if (!role) {
            res.status(404).json({ error: 'Role not found' });
            return;
        }
        res.json(role);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch role' });
    }
};
exports.getRoleById = getRoleById;
// Create Role
const createRole = async (req, res) => {
    const { name, description, permissions } = req.body;
    if (!name) {
        res.status(400).json({ error: 'Role name is required' });
        return;
    }
    try {
        const role = await db_1.default.role.create({
            data: { name, description, permissions }
        });
        res.status(201).json(role);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create role' });
    }
};
exports.createRole = createRole;
// Update Role
const updateRole = async (req, res) => {
    const { id } = req.params;
    const { name, description, permissions } = req.body;
    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    try {
        const role = await db_1.default.role.update({
            where: { id },
            data: { name, description, permissions }
        });
        res.json(role);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update role' });
    }
};
exports.updateRole = updateRole;
// Delete Role
const deleteRole = async (req, res) => {
    const { id } = req.params;
    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    try {
        await db_1.default.role.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete role' });
    }
};
exports.deleteRole = deleteRole;
//# sourceMappingURL=roleController.js.map