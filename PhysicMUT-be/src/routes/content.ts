import { Router } from 'express';
import upload from '../middleware/upload';
import {
  getChapters,
  createChapter,
  getLessonById,
  createLesson,
  getTheories,
  createTheory,
  updateTheory,
  deleteTheory,
  getModels3D,
  createModel3D,
  updateModel3D,
  deleteModel3D,
  getExamples,
  createExample,
  updateExample,
  deleteExample,
  getExercises,
  createExercise,
  updateExercise,
  deleteExercise
} from '../controllers/contentController';

const router = Router();

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
router.get('/chapters', getChapters);

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
router.post('/chapters', createChapter);

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
router.get('/lessons/:id', getLessonById);

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
router.post('/lessons', createLesson);

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
router.get('/theories', getTheories);
router.post('/theories', createTheory);

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
router.put('/theories/:id', updateTheory);
router.delete('/theories/:id', deleteTheory);

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
router.get('/models3d', getModels3D);
router.post('/models3d', upload.fields([{ name: 'source', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), createModel3D);

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
router.put('/models3d/:id', upload.fields([{ name: 'source', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), updateModel3D);
router.delete('/models3d/:id', deleteModel3D);

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
router.get('/examples', getExamples);
router.post('/examples', createExample);

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
router.put('/examples/:id', updateExample);
router.delete('/examples/:id', deleteExample);

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
router.get('/exercises', getExercises);
router.post('/exercises', createExercise);

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
router.put('/exercises/:id', updateExercise);
router.delete('/exercises/:id', deleteExercise);

export default router;
