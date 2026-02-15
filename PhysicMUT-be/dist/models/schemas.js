"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The user ID.
 *         username:
 *           type: string
 *           description: The username.
 *         email:
 *           type: string
 *           format: email
 *           description: The user email.
 *         full_name:
 *           type: string
 *           description: The user's full name.
 *         role:
 *           type: string
 *           enum: [ADMIN, TEACHER, STUDENT]
 *           description: The user's role.
 *       example:
 *         id: d5fE_asz
 *         username: johndoe
 *         email: johndoe@example.com
 *         full_name: John Doe
 *         role: STUDENT
 *
 *     Error:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: error
 *         message:
 *           type: string
 *           example: An unexpected error occurred.
 */
//# sourceMappingURL=schemas.js.map