import { Router } from 'express';
import upload from '../middleware/upload';
import {
  getTheoryCategories,
  getTheories,
  createTheory,
  updateTheory,
  deleteTheory,
  getModel3DTypes,
  getModels3D,
  getModel3DByTypeName,
  createModel3D,
  updateModel3D,
  deleteModel3D,
  getExampleCategories,
  getExamples,
  createExample,
  updateExample,
  deleteExample,
  getExerciseCategories,
  getExerciseTypes,
  getExercises,
  createExercise,
  updateExercise,
  deleteExercise,
  updateTheoryStatus,
  updateModel3DStatus,
  updateExampleStatus,
  updateExerciseStatus
} from '../controllers/contentController';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Content
 *   description: Educational content management (3D Models and associated Materials)
 */

// --- Model 3D (The Anchor) ---

/**
 * @openapi
 * /content/models3d:
 *   get:
 *     summary: List all 3D models
 *     tags: [Content]
 */
router.get('/models3d/types', getModel3DTypes);
router.get('/models3d', getModels3D);

/**
 * @openapi
 * /content/models3d/{typeName}:
 *   get:
 *     summary: Get a 3D model by Type Name
 *     tags: [Content]
 */
router.get('/models3d/:typeName', getModel3DByTypeName);

/**
 * @openapi
 * /content/models3d:
 *   post:
 *     summary: Create a 3D model
 *     tags: [Content]
 */
router.post('/models3d', upload.fields([{ name: 'source', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), createModel3D);

/**
 * @openapi
 * /content/models3d/{typeName}:
 *   put:
 *     summary: Update a 3D model
 *     tags: [Content]
 */
router.put('/models3d/:typeName', upload.fields([{ name: 'source', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), updateModel3D);
router.patch('/models3d/:typeName/status', updateModel3DStatus);
router.delete('/models3d/:typeName', deleteModel3D);

// --- Theories ---

router.get('/theories/categories', getTheoryCategories);
router.get('/theories', getTheories);
router.post('/theories', createTheory);
router.put('/theories/:id', updateTheory);
router.patch('/theories/:id/status', updateTheoryStatus);
router.delete('/theories/:id', deleteTheory);

// --- Examples ---

router.get('/examples/categories', getExampleCategories);
router.get('/examples', getExamples);
router.post('/examples', createExample);
router.put('/examples/:id', updateExample);
router.patch('/examples/:id/status', updateExampleStatus);
router.delete('/examples/:id', deleteExample);

// --- Exercises ---

router.get('/exercises/categories', getExerciseCategories);
router.get('/exercises/types', getExerciseTypes);
router.get('/exercises', getExercises);
router.post('/exercises', createExercise);
router.put('/exercises/:id', updateExercise);
router.patch('/exercises/:id/status', updateExerciseStatus);
router.delete('/exercises/:id', deleteExercise);

export default router;
