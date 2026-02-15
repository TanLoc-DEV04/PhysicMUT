"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExercise = exports.updateExercise = exports.createExercise = exports.getExercises = exports.deleteExample = exports.updateExample = exports.createExample = exports.getExamples = exports.deleteModel3D = exports.updateModel3D = exports.createModel3D = exports.getModels3D = exports.deleteTheory = exports.updateTheory = exports.createTheory = exports.getTheories = exports.createLesson = exports.getLessonById = exports.createChapter = exports.getChapters = void 0;
const db_1 = __importDefault(require("../config/db"));
// --- CHAPTERS ---
const getChapters = async (req, res) => {
    try {
        const chapters = await db_1.default.chapter.findMany({
            include: {
                lessons: {
                    orderBy: { order: 'asc' },
                    include: {
                        models3d: {
                            select: { thumbnail_url: true, description: true }
                        }
                    }
                },
            },
            orderBy: { order: 'asc' },
        });
        res.json(chapters);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch chapters' });
    }
};
exports.getChapters = getChapters;
const createChapter = async (req, res) => {
    const { name, description, order } = req.body;
    try {
        const chapter = await db_1.default.chapter.create({
            data: { name, description, order },
        });
        res.status(201).json(chapter);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create chapter' });
    }
};
exports.createChapter = createChapter;
// --- LESSONS ---
const getLessonById = async (req, res) => {
    const { id } = req.params;
    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    try {
        const lesson = await db_1.default.lesson.findUnique({
            where: { id },
            include: {
                theories: true,
                models3d: true,
                examples: true,
                exercises: true,
            },
        });
        if (!lesson) {
            res.status(404).json({ error: 'Lesson not found' });
            return;
        }
        res.json(lesson);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch lesson' });
    }
};
exports.getLessonById = getLessonById;
const createLesson = async (req, res) => {
    const { name, chapter_id, order } = req.body;
    try {
        const lesson = await db_1.default.lesson.create({
            data: { name, chapter_id, order },
        });
        res.status(201).json(lesson);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create lesson' });
    }
};
exports.createLesson = createLesson;
// --- CONTENT (Theories, Models) ---
// THEORIES
const getTheories = async (req, res) => {
    try {
        const theories = await db_1.default.theory.findMany({
            orderBy: { created_at: 'desc' }
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
    const { lesson_id, title, content_html, type, status } = req.body;
    try {
        const theory = await db_1.default.theory.create({
            data: { lesson_id, title, content_html, type, status },
        });
        res.status(201).json(theory);
    }
    catch (error) {
        console.error('Error creating theory:', error);
        res.status(500).json({ error: 'Failed to create theory' });
    }
};
exports.createTheory = createTheory;
const updateTheory = async (req, res) => {
    const { id } = req.params;
    const { title, content_html, type, status } = req.body;
    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    try {
        const theory = await db_1.default.theory.update({
            where: { id },
            data: { title, content_html, type, status }
        });
        res.json(theory);
    }
    catch (error) {
        console.error('Error updating theory:', error);
        res.status(500).json({ error: 'Failed to update theory' });
    }
};
exports.updateTheory = updateTheory;
const deleteTheory = async (req, res) => {
    const { id } = req.params;
    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    try {
        await db_1.default.theory.delete({ where: { id } });
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting theory:', error);
        res.status(500).json({ error: 'Failed to delete theory' });
    }
};
exports.deleteTheory = deleteTheory;
// MODELS 3D
const getModels3D = async (req, res) => {
    try {
        const models = await db_1.default.model3D.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json(models);
    }
    catch (error) {
        console.error('Error fetching models:', error);
        res.status(500).json({ error: 'Failed to fetch 3D models' });
    }
};
exports.getModels3D = getModels3D;
const createModel3D = async (req, res) => {
    const { lesson_id, name, description, type, status } = req.body;
    // Handle file uploads
    const files = req.files;
    const source_url = files?.['source']?.[0]?.path.replace(/\\/g, '/');
    const thumbnail_url = files?.['thumbnail']?.[0]?.path.replace(/\\/g, '/');
    if (!source_url) {
        res.status(400).json({ error: 'Source file (GLB/GLTF) is required' });
        return;
    }
    try {
        const model = await db_1.default.model3D.create({
            data: {
                lesson_id,
                name,
                description,
                source_url,
                thumbnail_url: thumbnail_url || '',
                type,
                status
            },
        });
        res.status(201).json(model);
    }
    catch (error) {
        console.error('Error creating model:', error);
        res.status(500).json({ error: 'Failed to create 3D model' });
    }
};
exports.createModel3D = createModel3D;
const updateModel3D = async (req, res) => {
    const { id } = req.params;
    const { name, description, type, status } = req.body;
    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    // Handle file uploads
    const files = req.files;
    const source_url = files?.['source']?.[0]?.path.replace(/\\/g, '/');
    const thumbnail_url = files?.['thumbnail']?.[0]?.path.replace(/\\/g, '/');
    const updateData = { name, description, type, status };
    if (source_url)
        updateData.source_url = source_url;
    if (thumbnail_url)
        updateData.thumbnail_url = thumbnail_url;
    try {
        const model = await db_1.default.model3D.update({
            where: { id },
            data: updateData
        });
        res.json(model);
    }
    catch (error) {
        console.error('Error updating model:', error);
        res.status(500).json({ error: 'Failed to update 3D model' });
    }
};
exports.updateModel3D = updateModel3D;
const deleteModel3D = async (req, res) => {
    const { id } = req.params;
    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    try {
        await db_1.default.model3D.delete({ where: { id } });
        // TODO: Delete physical files
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting model:', error);
        res.status(500).json({ error: 'Failed to delete 3D model' });
    }
};
exports.deleteModel3D = deleteModel3D;
// EXAMPLES
const getExamples = async (req, res) => {
    try {
        const examples = await db_1.default.example.findMany({
            orderBy: { created_at: 'desc' }
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
    const { lesson_id, title, problem, solution, type, status, reference } = req.body;
    try {
        const example = await db_1.default.example.create({
            data: { lesson_id, title, problem, solution, type, status, reference }
        });
        res.status(201).json(example);
    }
    catch (error) {
        console.error('Error creating example:', error);
        res.status(500).json({ error: 'Failed to create example' });
    }
};
exports.createExample = createExample;
const updateExample = async (req, res) => {
    const { id } = req.params;
    const { title, problem, solution, type, status, reference } = req.body;
    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    try {
        const example = await db_1.default.example.update({
            where: { id },
            data: { title, problem, solution, type, status, reference }
        });
        res.json(example);
    }
    catch (error) {
        console.error('Error updating example:', error);
        res.status(500).json({ error: 'Failed to update example' });
    }
};
exports.updateExample = updateExample;
const deleteExample = async (req, res) => {
    const { id } = req.params;
    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    try {
        await db_1.default.example.delete({ where: { id } });
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting example:', error);
        res.status(500).json({ error: 'Failed to delete example' });
    }
};
exports.deleteExample = deleteExample;
// EXERCISES
const getExercises = async (req, res) => {
    try {
        const exercises = await db_1.default.exercise.findMany({
            orderBy: { created_at: 'desc' }
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
    const { lesson_id, question, options, correct_answer, level, type, status, reference } = req.body;
    try {
        const exercise = await db_1.default.exercise.create({
            data: {
                lesson_id,
                question,
                options: typeof options === 'string' ? JSON.parse(options) : options,
                correct_answer,
                level,
                type,
                status,
                reference
            }
        });
        res.status(201).json(exercise);
    }
    catch (error) {
        console.error('Error creating exercise:', error);
        res.status(500).json({ error: 'Failed to create exercise' });
    }
};
exports.createExercise = createExercise;
const updateExercise = async (req, res) => {
    const { id } = req.params;
    const { question, options, correct_answer, level, type, status, reference } = req.body;
    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    try {
        const exercise = await db_1.default.exercise.update({
            where: { id },
            data: {
                question,
                options: typeof options === 'string' ? JSON.parse(options) : options,
                correct_answer,
                level,
                type,
                status,
                reference
            }
        });
        res.json(exercise);
    }
    catch (error) {
        console.error('Error updating exercise:', error);
        res.status(500).json({ error: 'Failed to update exercise' });
    }
};
exports.updateExercise = updateExercise;
const deleteExercise = async (req, res) => {
    const { id } = req.params;
    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    try {
        await db_1.default.exercise.delete({ where: { id } });
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting exercise:', error);
        res.status(500).json({ error: 'Failed to delete exercise' });
    }
};
exports.deleteExercise = deleteExercise;
//# sourceMappingURL=contentController.js.map