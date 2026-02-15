"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health Check
 *     description: Checks if the backend server is running.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Server is up and running.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: PhysicMUT Backend is running!
 */
router.get('/', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'PhysicMUT Backend is running!' });
});
exports.default = router;
//# sourceMappingURL=health.js.map