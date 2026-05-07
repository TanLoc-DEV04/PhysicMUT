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
exports.updateUserStatus = exports.deleteUser = exports.updateUser = exports.getUserById = exports.createUser = exports.getUsers = void 0;
const userService = __importStar(require("../services/userService"));
const getUsers = async (req, res) => {
    try {
        const users = await userService.getUsers({
            roleId: req.query.roleId,
            search: req.query.search
        });
        res.json(users);
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};
exports.getUsers = getUsers;
const createUser = async (req, res) => {
    try {
        const newUser = await userService.createUser(req.body);
        res.status(201).json(newUser);
    }
    catch (error) {
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
exports.createUser = createUser;
const getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};
exports.getUserById = getUserById;
const updateUser = async (req, res) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body);
        res.json(user);
    }
    catch (error) {
        console.error(error);
        if (error.message && error.message.includes('Invalid data')) {
            res.status(400).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: 'Failed to update user' });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
exports.deleteUser = deleteUser;
const updateUserStatus = async (req, res) => {
    try {
        const user = await userService.updateUserStatus(req.params.id, req.body.is_active);
        res.json(user);
    }
    catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ error: 'Failed to update user status' });
    }
};
exports.updateUserStatus = updateUserStatus;
//# sourceMappingURL=userController.js.map