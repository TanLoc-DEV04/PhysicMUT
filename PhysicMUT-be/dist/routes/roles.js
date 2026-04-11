"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roleController_1 = require("../controllers/roleController");
const router = (0, express_1.Router)();
/**
 * @openapi
 * tags:
 *   name: Roles
 *   description: Role management API
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Role ID
 *         name:
 *           type: string
 *           description: Role name
 *         description:
 *           type: string
 *           description: Role description
 *         permissions:
 *           type: object
 *           description: Role permissions
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */
/**
 * @openapi
 * /roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: List of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 */
router.get('/', roleController_1.getRoles);
/**
 * @openapi
 * /roles/admin-roles:
 *   get:
 *     summary: Get active admin-level roles only (for Add Admin dropdown)
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: List of active admin roles (excludes USER, STUDENT)
 */
router.get('/admin-roles', roleController_1.getAdminRoles);
/**
 * @openapi
 * /roles/{id}:
 *   get:
 *     summary: Get role by ID
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role details
 *       404:
 *         description: Role not found
 */
router.get('/:id', roleController_1.getRoleById);
/**
 * @openapi
 * /roles:
 *   post:
 *     summary: Create new role
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               permissions:
 *                 type: object
 *     responses:
 *       201:
 *         description: Role created
 */
router.post('/', roleController_1.createRole);
/**
 * @openapi
 * /roles/{id}:
 *   put:
 *     summary: Update role
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               permissions:
 *                 type: object
 *     responses:
 *       200:
 *         description: Role updated
 */
router.put('/:id', roleController_1.updateRole);
/**
 * @openapi
 * /roles/{id}:
 *   delete:
 *     summary: Delete role
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Role deleted
 */
router.delete('/:id', roleController_1.deleteRole);
/**
 * @openapi
 * /roles/{id}/status:
 *   patch:
 *     summary: Toggle role active/inactive status
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [is_active]
 *             properties:
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Role status updated
 */
router.patch('/:id/status', roleController_1.toggleRoleStatus);
exports.default = router;
//# sourceMappingURL=roles.js.map