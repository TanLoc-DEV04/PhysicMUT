import { Request, Response, NextFunction } from 'express';
/**
 * Middleware: requireAdminAccess
 * Checks that the user has an active account AND an active admin-level role.
 * This prevents access even if a USER/STUDENT account somehow gets into admin panel.
 *
 * Usage: Pass userId in request headers as 'x-user-id' (mock, real JWT would decode this).
 * Returns 403 Forbidden if the check fails.
 */
export declare const requireAdminAccess: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=adminMiddleware.d.ts.map