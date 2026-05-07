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
exports.forgotPassword = exports.changePassword = exports.googleLogin = exports.register = exports.login = void 0;
const authService = __importStar(require("../services/authService"));
const login = async (req, res) => {
    try {
        const result = await authService.login(req.body);
        res.json({ message: 'Login successful', ...result });
    }
    catch (error) {
        if (error.message === 'Invalid credentials') {
            res.status(401).json({ error: error.message });
        }
        else if (error.message === 'Your account or role has been disabled.') {
            res.status(403).json({ error: error.message });
        }
        else {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
exports.login = login;
const register = async (req, res) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json({ message: 'User registered successfully', ...result });
    }
    catch (error) {
        if (error.message === 'Username or email already exists') {
            res.status(400).json({ error: error.message });
        }
        else {
            console.error('Register error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
exports.register = register;
const googleLogin = async (req, res) => {
    try {
        const result = await authService.googleLogin(req.body.credential);
        res.json({ message: 'Google Login successful', ...result });
    }
    catch (error) {
        if (error.message === 'Invalid Google token' || error.message.includes('disabled')) {
            res.status(error.message.includes('disabled') ? 403 : 400).json({ error: error.message });
        }
        else {
            console.error('Google login error:', error);
            res.status(500).json({ error: 'Google authentication failed' });
        }
    }
};
exports.googleLogin = googleLogin;
const changePassword = async (req, res) => {
    try {
        await authService.changePassword(req.body);
        res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        if (error.message === 'Incorrect old password') {
            res.status(401).json({ error: error.message });
        }
        else if (error.message === 'User not found') {
            res.status(404).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to change password' });
        }
    }
};
exports.changePassword = changePassword;
const forgotPassword = async (req, res) => {
    try {
        // Logic handled in service? Right now just a placeholder return
        res.json({ message: 'If this email is registered, a password reset link has been sent.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to process forgot password request' });
    }
};
exports.forgotPassword = forgotPassword;
//# sourceMappingURL=authController.js.map