"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = __importDefault(require("../middlewares/upload"));
const validateRequest_1 = require("../middlewares/validateRequest");
const content_validator_1 = require("../validators/content.validator");
const contentController_1 = require("../controllers/contentController");
const router = (0, express_1.Router)();
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
router.get('/models3d/types', contentController_1.getModel3DTypes);
router.get('/models3d', contentController_1.getModels3D);
/**
 * @openapi
 * /content/models3d/{typeName}:
 *   get:
 *     summary: Get a 3D model by Type Name
 *     tags: [Content]
 */
router.get('/models3d/:typeName', (0, validateRequest_1.validateRequest)(content_validator_1.typeNameParamSchema), contentController_1.getModel3DByTypeName);
/**
 * @openapi
 * /content/models3d:
 *   post:
 *     summary: Create a 3D model
 *     tags: [Content]
 */
router.post('/models3d', upload_1.default.fields([{ name: 'source', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), (0, validateRequest_1.validateRequest)(content_validator_1.createModelSchema), contentController_1.createModel3D);
/**
 * @openapi
 * /content/models3d/{typeName}:
 *   put:
 *     summary: Update a 3D model
 *     tags: [Content]
 */
router.put('/models3d/:typeName', upload_1.default.fields([{ name: 'source', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), (0, validateRequest_1.validateRequest)(content_validator_1.typeNameParamSchema), contentController_1.updateModel3D);
router.patch('/models3d/:typeName/status', (0, validateRequest_1.validateRequest)(content_validator_1.toggleStatusSchema), contentController_1.updateModel3DStatus);
router.delete('/models3d/:typeName', (0, validateRequest_1.validateRequest)(content_validator_1.typeNameParamSchema), contentController_1.deleteModel3D);
// --- Theories ---
router.get('/theories/categories', contentController_1.getTheoryCategories);
router.get('/theories', contentController_1.getTheories);
router.post('/theories', (0, validateRequest_1.validateRequest)(content_validator_1.createTheorySchema), contentController_1.createTheory);
router.put('/theories/:id', (0, validateRequest_1.validateRequest)(content_validator_1.idParamSchema), contentController_1.updateTheory);
router.patch('/theories/:id/status', (0, validateRequest_1.validateRequest)(content_validator_1.toggleStatusSchema), contentController_1.updateTheoryStatus);
router.delete('/theories/:id', (0, validateRequest_1.validateRequest)(content_validator_1.idParamSchema), contentController_1.deleteTheory);
// --- Examples ---
router.get('/examples/categories', contentController_1.getExampleCategories);
router.get('/examples', contentController_1.getExamples);
router.post('/examples', (0, validateRequest_1.validateRequest)(content_validator_1.createExampleSchema), contentController_1.createExample);
router.put('/examples/:id', (0, validateRequest_1.validateRequest)(content_validator_1.idParamSchema), contentController_1.updateExample);
router.patch('/examples/:id/status', (0, validateRequest_1.validateRequest)(content_validator_1.toggleStatusSchema), contentController_1.updateExampleStatus);
router.delete('/examples/:id', (0, validateRequest_1.validateRequest)(content_validator_1.idParamSchema), contentController_1.deleteExample);
// --- Exercises ---
router.get('/exercises/categories', contentController_1.getExerciseCategories);
router.get('/exercises/types', contentController_1.getExerciseTypes);
router.get('/exercises', contentController_1.getExercises);
router.post('/exercises', (0, validateRequest_1.validateRequest)(content_validator_1.createExerciseSchema), contentController_1.createExercise);
router.put('/exercises/:id', (0, validateRequest_1.validateRequest)(content_validator_1.idParamSchema), contentController_1.updateExercise);
router.patch('/exercises/:id/status', (0, validateRequest_1.validateRequest)(content_validator_1.toggleStatusSchema), contentController_1.updateExerciseStatus);
router.delete('/exercises/:id', (0, validateRequest_1.validateRequest)(content_validator_1.idParamSchema), contentController_1.deleteExercise);
exports.default = router;
//# sourceMappingURL=content.js.map