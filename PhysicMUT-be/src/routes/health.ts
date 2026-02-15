import { Router, Request, Response } from 'express';

const router = Router();

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
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'PhysicMUT Backend is running!' });
});

export default router;
