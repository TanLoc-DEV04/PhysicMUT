"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdminAccess = void 0;
const db_1 = __importDefault(require("../config/db"));
// Roles that are NOT allowed access to admin panel
const NON_ADMIN_ROLES = ['USER', 'STUDENT'];
/**
 * Middleware: requireAdminAccess
 * Checks that the user has an active account AND an active admin-level role.
 * This prevents access even if a USER/STUDENT account somehow gets into admin panel.
 *
 * Usage: Pass userId in request headers as 'x-user-id' (mock, real JWT would decode this).
 * Returns 403 Forbidden if the check fails.
 */
const requireAdminAccess = async (req, res, next) => {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized: No user ID provided' });
        return;
    }
    try {
        const user = await db_1.default.user.findUnique({
            where: { id: userId },
            include: { role: true }
        });
        if (!user) {
            res.status(401).json({ error: 'Unauthorized: User not found' });
            return;
        }
        // Check 1: User account must be active
        if (!user.is_active) {
            res.status(403).json({ error: 'Forbidden: Tài khoản của bạn đã bị vô hiệu hóa.' });
            return;
        }
        // Check 2: Role must exist and be active
        if (!user.role || !user.role.is_active) {
            res.status(403).json({ error: 'Forbidden: Role của bạn đã bị vô hiệu hóa.' });
            return;
        }
        // Check 3: Role must not be a non-admin role
        if (NON_ADMIN_ROLES.includes(user.role.name)) {
            res.status(403).json({
                error: 'Forbidden: Tài khoản của bạn không có quyền truy cập trang quản trị.'
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Admin access check error:', error);
        res.status(500).json({ error: 'Internal server error during access check' });
    }
};
exports.requireAdminAccess = requireAdminAccess;
//# sourceMappingURL=adminMiddleware.js.map