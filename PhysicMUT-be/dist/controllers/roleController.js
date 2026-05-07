"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRole = exports.toggleRoleStatus = exports.updateRole = exports.createRole = exports.getRoleById = exports.getAdminRoles = exports.getRoles = void 0;
const roleService = __importStar(require("../services/roleService"));
// Get all roles
const getRoles = async (req, res) => {
    try {
        const roles = await roleService.getRoles();
        res.json(roles);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch roles' });
    }
};
exports.getRoles = getRoles;
// Get only admin-level active roles
const getAdminRoles = async (req, res) => {
    try {
        const roles = await roleService.getAdminRoles();
        res.json(roles);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch admin roles' });
    }
};
exports.getAdminRoles = getAdminRoles;
// Get role by ID
const getRoleById = async (req, res) => {
    try {
        const role = await roleService.getRoleById(req.params.id);
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
    try {
        const role = await roleService.createRole(req.body);
        res.status(201).json(role);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create role' });
    }
};
exports.createRole = createRole;
// Update Role
const updateRole = async (req, res) => {
    try {
        const role = await roleService.updateRole(req.params.id, req.body);
        res.json(role);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update role' });
    }
};
exports.updateRole = updateRole;
// Toggle Role active status
const toggleRoleStatus = async (req, res) => {
    try {
        const role = await roleService.toggleRoleStatus(req.params.id, req.body.is_active);
        res.json(role);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update role status' });
    }
};
exports.toggleRoleStatus = toggleRoleStatus;
// Delete Role
const deleteRole = async (req, res) => {
    try {
        await roleService.deleteRole(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        if (error.message && error.message.includes('Cannot delete role')) {
            res.status(400).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: 'Failed to delete role' });
    }
};
exports.deleteRole = deleteRole;
//# sourceMappingURL=roleController.js.map