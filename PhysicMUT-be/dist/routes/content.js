"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = __importDefault(require("../middleware/upload"));
const contentController_1 = require("../controllers/contentController");
const router = (0, express_1.Router)();
/**
 * @openapi
 * tags:
 *   name: Content
 *   description: Educational content management (Chapters, Lessons, Materials)
 */
// --- CHAPTERS ---
/**
 * @openapi
 * /content/chapters:
 *   get:
 *     summary: List all chapters
 *     tags: [Content]
 *     responses:
 *       200:
 *         description: List of chapters with lessons
 */
router.get('/chapters', contentController_1.getChapters);
/**
 * @openapi
 * /content/chapters:
 *   post:
 *     summary: Create a new chapter
 *     tags: [Content]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Chapter created
 */
router.post('/chapters', contentController_1.createChapter);
// --- LESSONS ---
/**
 * @openapi
 * /content/lessons/{id}:
 *   get:
 *     summary: Get lesson details
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson details with content
 *       404:
 *         description: Lesson not found
 */
router.get('/lessons/:id', contentController_1.getLessonById);
/**
 * @openapi
 * /content/lessons:
 *   post:
 *     summary: Create a new lesson
 *     tags: [Content]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, chapter_id]
 *             properties:
 *               name:
 *                 type: string
 *               chapter_id:
 *                 type: string
 *               order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Lesson created
 */
router.post('/lessons', contentController_1.createLesson);
// --- MATERIALS ---
// --- MATERIALS ---
// Note: Schemas should be defined in index.ts or separate swagger config, but effectively we describe them here in responses.
// --- Theories ---
/**
 * @openapi
 * /content/theories:
 *   get:
 *     summary: Get all theories
 *     tags: [Content]
 *     responses:
 *       200:
 *         description: List of theories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Theory'
 *   post:
 *     summary: Create a new theory
 *     tags: [Content]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lesson_id, title, content_html]
 *             properties:
 *               lesson_id: { type: string }
 *               title: { type: string }
 *               content_html: { type: string }
 *               type: { type: string }
 *               status: { type: string }
 *     responses:
 *       201:
 *         description: Theory created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Theory'
 */
router.get('/theories/types', contentController_1.getTheoryTypes);
router.get('/theories', contentController_1.getTheories);
router.post('/theories', contentController_1.createTheory);
/**
 * @openapi
 * /content/theories/{id}:
 *   put:
 *     summary: Update a theory
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               content_html: { type: string }
 *               type: { type: string }
 *               status: { type: string }
 *     responses:
 *       200:
 *         description: Theory updated
 *   delete:
 *     summary: Delete a theory
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Theory deleted
 */
router.put('/theories/:id', contentController_1.updateTheory);
router.patch('/theories/:id/status', contentController_1.updateTheoryStatus);
router.delete('/theories/:id', contentController_1.deleteTheory);
// --- Model 3D ---
/**
 * @openapi
 * /content/models3d:
 *   get:
 *     summary: Get all 3D models
 *     tags: [Content]
 *     responses:
 *       200:
 *         description: List of 3D models
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Model3D'
 *   post:
 *     summary: Create a new 3D model (Multipart)
 *     tags: [Content]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               lesson_id: { type: string }
 *               name: { type: string }
 *               description: { type: string }
 *               type: { type: string }
 *               status: { type: string }
 *               source:
 *                 type: string
 *                 format: binary
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Model created
 */
router.get('/models3d/types', contentController_1.getModel3DTypes);
router.get('/models3d', contentController_1.getModels3D);
router.post('/models3d', upload_1.default.fields([{ name: 'source', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), contentController_1.createModel3D);
/**
 * @openapi
 * /content/models3d/{id}:
 *   put:
 *     summary: Update a 3D model
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               type: { type: string }
 *               status: { type: string }
 *               source: { type: string, format: binary }
 *               thumbnail: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Model updated
 *   delete:
 *     summary: Delete a 3D model
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Model deleted
 */
router.put('/models3d/:id', upload_1.default.fields([{ name: 'source', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), contentController_1.updateModel3D);
router.patch('/models3d/:id/status', contentController_1.updateModel3DStatus);
router.delete('/models3d/:id', contentController_1.deleteModel3D);
// --- Examples ---
/**
 * @openapi
 * /content/examples:
 *   get:
 *     summary: Get all examples
 *     tags: [Content]
 *     responses:
 *       200:
 *         description: List of examples
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Example'
 *   post:
 *     summary: Create a new example
 *     tags: [Content]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lesson_id, title, problem, solution]
 *             properties:
 *               lesson_id: { type: string }
 *               title: { type: string }
 *               problem: { type: string }
 *               solution: { type: string }
 *               type: { type: string }
 *               status: { type: string }
 *               reference: { type: string }
 *     responses:
 *       201:
 *         description: Example created
 */
router.get('/examples/types', contentController_1.getExampleTypes);
router.get('/examples', contentController_1.getExamples);
router.post('/examples', contentController_1.createExample);
/**
 * @openapi
 * /content/examples/{id}:
 *   put:
 *     summary: Update an example
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               problem: { type: string }
 *               solution: { type: string }
 *               type: { type: string }
 *               status: { type: string }
 *               reference: { type: string }
 *     responses:
 *       200:
 *         description: Example updated
 *   delete:
 *     summary: Delete an example
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Example deleted
 */
router.put('/examples/:id', contentController_1.updateExample);
router.patch('/examples/:id/status', contentController_1.updateExampleStatus);
router.delete('/examples/:id', contentController_1.deleteExample);
// --- Exercises ---
/**
 * @openapi
 * /content/exercises:
 *   get:
 *     summary: Get all exercises
 *     tags: [Content]
 *     responses:
 *       200:
 *         description: List of exercises
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Exercise'
 *   post:
 *     summary: Create a new exercise
 *     tags: [Content]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lesson_id, question, options, correct_answer]
 *             properties:
 *               lesson_id: { type: string }
 *               question: { type: string }
 *               options: { type: array, items: { type: object } }
 *               correct_answer: { type: string }
 *               level: { type: string }
 *               type: { type: string }
 *               status: { type: string }
 *     responses:
 *       201:
 *         description: Exercise created
 */
router.get('/exercises/types', contentController_1.getExerciseTypes);
router.get('/exercises', contentController_1.getExercises);
router.post('/exercises', contentController_1.createExercise);
/**
 * @openapi
 * /content/exercises/{id}:
 *   put:
 *     summary: Update an exercise
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question: { type: string }
 *               options: { type: array }
 *               correct_answer: { type: string }
 *               level: { type: string }
 *               type: { type: string }
 *               status: { type: string }
 *     responses:
 *       200:
 *         description: Exercise updated
 *   delete:
 *     summary: Delete an exercise
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Exercise deleted
 */
router.put('/exercises/:id', contentController_1.updateExercise);
router.patch('/exercises/:id/status', contentController_1.updateExerciseStatus);
router.delete('/exercises/:id', contentController_1.deleteExercise);
exports.default = router;
//# sourceMappingURL=content.js.map