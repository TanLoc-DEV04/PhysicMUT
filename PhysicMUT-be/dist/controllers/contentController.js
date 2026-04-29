"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExercise = exports.updateExerciseStatus = exports.updateExercise = exports.createExercise = exports.getExercises = exports.getExerciseTypes = exports.getExerciseCategories = exports.deleteExample = exports.updateExampleStatus = exports.updateExample = exports.createExample = exports.getExamples = exports.getExampleCategories = exports.deleteTheory = exports.updateTheoryStatus = exports.updateTheory = exports.createTheory = exports.getTheories = exports.getTheoryCategories = exports.deleteModel3D = exports.updateModel3DStatus = exports.updateModel3D = exports.createModel3D = exports.getModel3DByTypeName = exports.getModels3D = exports.getModel3DTypes = void 0;
const contentService = __importStar(require("../services/contentService"));
const getModel3DTypes = async (req, res) => {
    try {
        const typeList = await contentService.getModel3DTypes();
        res.json(typeList);
    }
    catch (error) {
        console.error('Error fetching model 3d types:', error);
        res.status(500).json({ error: 'Failed to fetch model 3d types' });
    }
};
exports.getModel3DTypes = getModel3DTypes;
const getModels3D = async (req, res) => {
    try {
        const models = await contentService.getModels3D({
            model_type_name: req.query.model_type_name,
            search: req.query.search
        });
        res.json(models);
    }
    catch (error) {
        console.error('Error fetching models:', error);
        res.status(500).json({ error: 'Failed to fetch 3D models' });
    }
};
exports.getModels3D = getModels3D;
const getModel3DByTypeName = async (req, res) => {
    try {
        const model = await contentService.getModel3DByTypeName(req.params.typeName);
        if (!model) {
            res.status(404).json({ error: 'Model not found' });
            return;
        }
        res.json(model);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch model details' });
    }
};
exports.getModel3DByTypeName = getModel3DByTypeName;
const createModel3D = async (req, res) => {
    try {
        const model = await contentService.createModel3D(req.body, req.files);
        res.status(201).json(model);
    }
    catch (error) {
        console.error('Error creating model:', error);
        res.status(500).json({ error: 'Failed to create 3D model' });
    }
};
exports.createModel3D = createModel3D;
const updateModel3D = async (req, res) => {
    try {
        const model = await contentService.updateModel3D(req.params.typeName, req.body, req.files);
        res.json(model);
    }
    catch (error) {
        console.error('Error updating model:', error);
        res.status(500).json({ error: 'Failed to update 3D model' });
    }
};
exports.updateModel3D = updateModel3D;
const updateModel3DStatus = async (req, res) => {
    try {
        const model = await contentService.updateModel3DStatus(req.params.typeName, req.body.status);
        res.json(model);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update model status' });
    }
};
exports.updateModel3DStatus = updateModel3DStatus;
const deleteModel3D = async (req, res) => {
    try {
        await contentService.deleteModel3D(req.params.typeName);
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting model:', error);
        res.status(500).json({ error: 'Failed to delete 3D model' });
    }
};
exports.deleteModel3D = deleteModel3D;
// --- THEORIES ---
const getTheoryCategories = async (req, res) => {
    try {
        const categories = await contentService.getTheoryCategories();
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch theory categories' });
    }
};
exports.getTheoryCategories = getTheoryCategories;
const getTheories = async (req, res) => {
    try {
        const theories = await contentService.getTheories({
            model_type_name: req.query.model_type_name,
            theory_type_name: req.query.theory_type_name,
            search: req.query.search
        });
        res.json(theories);
    }
    catch (error) {
        console.error('Error fetching theories:', error);
        res.status(500).json({ error: 'Failed to fetch theories' });
    }
};
exports.getTheories = getTheories;
const createTheory = async (req, res) => {
    try {
        const theory = await contentService.createTheory(req.body);
        res.status(201).json(theory);
    }
    catch (error) {
        console.error('Error creating theory:', error);
        res.status(500).json({ error: 'Failed to create theory' });
    }
};
exports.createTheory = createTheory;
const updateTheory = async (req, res) => {
    try {
        const theory = await contentService.updateTheory(req.params.id, req.body);
        res.json(theory);
    }
    catch (error) {
        console.error('Error updating theory:', error);
        res.status(500).json({ error: 'Failed to update theory' });
    }
};
exports.updateTheory = updateTheory;
const updateTheoryStatus = async (req, res) => {
    try {
        const theory = await contentService.updateTheoryStatus(req.params.id, req.body.status);
        res.json(theory);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update theory status' });
    }
};
exports.updateTheoryStatus = updateTheoryStatus;
const deleteTheory = async (req, res) => {
    try {
        await contentService.deleteTheory(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting theory:', error);
        res.status(500).json({ error: 'Failed to delete theory' });
    }
};
exports.deleteTheory = deleteTheory;
// --- EXAMPLES ---
const getExampleCategories = async (req, res) => {
    try {
        const categories = await contentService.getExampleCategories();
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch example categories' });
    }
};
exports.getExampleCategories = getExampleCategories;
const getExamples = async (req, res) => {
    try {
        const examples = await contentService.getExamples({
            model_type_name: req.query.model_type_name,
            example_type_name: req.query.example_type_name,
            search: req.query.search
        });
        res.json(examples);
    }
    catch (error) {
        console.error('Error fetching examples:', error);
        res.status(500).json({ error: 'Failed to fetch examples' });
    }
};
exports.getExamples = getExamples;
const createExample = async (req, res) => {
    try {
        const example = await contentService.createExample(req.body);
        res.status(201).json(example);
    }
    catch (error) {
        console.error('Error creating example:', error);
        res.status(500).json({ error: 'Failed to create example' });
    }
};
exports.createExample = createExample;
const updateExample = async (req, res) => {
    try {
        const example = await contentService.updateExample(req.params.id, req.body);
        res.json(example);
    }
    catch (error) {
        console.error('Error updating example:', error);
        res.status(500).json({ error: 'Failed to update example' });
    }
};
exports.updateExample = updateExample;
const updateExampleStatus = async (req, res) => {
    try {
        const example = await contentService.updateExampleStatus(req.params.id, req.body.status);
        res.json(example);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update example status' });
    }
};
exports.updateExampleStatus = updateExampleStatus;
const deleteExample = async (req, res) => {
    try {
        await contentService.deleteExample(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting example:', error);
        res.status(500).json({ error: 'Failed to delete example' });
    }
};
exports.deleteExample = deleteExample;
// --- EXERCISES ---
const getExerciseCategories = async (req, res) => {
    try {
        const categories = await contentService.getExerciseCategories();
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch exercise categories' });
    }
};
exports.getExerciseCategories = getExerciseCategories;
const getExerciseTypes = async (req, res) => {
    const types = await contentService.getExerciseTypes();
    res.json(types);
};
exports.getExerciseTypes = getExerciseTypes;
const getExercises = async (req, res) => {
    try {
        const exercises = await contentService.getExercises({
            model_type_name: req.query.model_type_name,
            exercise_type_name: req.query.exercise_type_name,
            type: req.query.type,
            search: req.query.search
        });
        res.json(exercises);
    }
    catch (error) {
        console.error('Error fetching exercises:', error);
        res.status(500).json({ error: 'Failed to fetch exercises' });
    }
};
exports.getExercises = getExercises;
const createExercise = async (req, res) => {
    try {
        const exercise = await contentService.createExercise(req.body);
        res.status(201).json(exercise);
    }
    catch (error) {
        console.error('Error creating exercise:', error);
        res.status(500).json({ error: 'Failed to create exercise' });
    }
};
exports.createExercise = createExercise;
const updateExercise = async (req, res) => {
    try {
        const exercise = await contentService.updateExercise(req.params.id, req.body);
        res.json(exercise);
    }
    catch (error) {
        console.error('Error updating exercise:', error);
        res.status(500).json({ error: 'Failed to update exercise' });
    }
};
exports.updateExercise = updateExercise;
const updateExerciseStatus = async (req, res) => {
    try {
        const exercise = await contentService.updateExerciseStatus(req.params.id, req.body.status);
        res.json(exercise);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update exercise status' });
    }
};
exports.updateExerciseStatus = updateExerciseStatus;
const deleteExercise = async (req, res) => {
    try {
        await contentService.deleteExercise(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting exercise:', error);
        res.status(500).json({ error: 'Failed to delete exercise' });
    }
};
exports.deleteExercise = deleteExercise;
//# sourceMappingURL=contentController.js.map