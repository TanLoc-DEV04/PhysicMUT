"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExercise = exports.updateExerciseStatus = exports.updateExercise = exports.createExercise = exports.getExercises = exports.getExerciseTypes = exports.deleteExample = exports.updateExampleStatus = exports.updateExample = exports.createExample = exports.getExamples = exports.getExampleTypes = exports.deleteModel3D = exports.updateModel3DStatus = exports.updateModel3D = exports.createModel3D = exports.getModels3D = exports.getModel3DTypes = exports.deleteTheory = exports.updateTheoryStatus = exports.updateTheory = exports.createTheory = exports.getTheories = exports.getTheoryTypes = exports.createLesson = exports.getLessonById = exports.createChapter = exports.getChapters = void 0;
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
                            where: { status: 'ACTIVE' },
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
                theories: { where: { status: 'ACTIVE' } },
                models3d: { where: { status: 'ACTIVE' } },
                examples: { where: { status: 'ACTIVE' } },
                exercises: { where: { status: 'ACTIVE' } },
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
const getTheoryTypes = async (req, res) => {
    try {
        const types = await db_1.default.theory.findMany({ select: { theory_type_name: true }, distinct: ['theory_type_name'] });
        res.json(types.map(t => t.theory_type_name).filter(Boolean));
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch theory types' });
    }
};
exports.getTheoryTypes = getTheoryTypes;
const getTheories = async (req, res) => {
    try {
        const { type, theory_type_name, search } = req.query;
        let whereClause = {};
        if (type && typeof type === 'string')
            whereClause.type = type;
        if (theory_type_name && typeof theory_type_name === 'string')
            whereClause.theory_type_name = theory_type_name;
        if (search && typeof search === 'string')
            whereClause.title = { contains: search, mode: 'insensitive' };
        const theories = await db_1.default.theory.findMany({
            where: whereClause,
            include: { lesson: true },
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
    const { lesson_id, title, content_html, type, theory_type_name, status } = req.body;
    try {
        const theory = await db_1.default.theory.create({
            data: { lesson_id, title, content_html, type, theory_type_name, status },
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
    const { title, content_html, type, theory_type_name, status } = req.body;
    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    try {
        const theory = await db_1.default.theory.update({
            where: { id },
            data: { title, content_html, type, theory_type_name, status }
        });
        res.json(theory);
    }
    catch (error) {
        console.error('Error updating theory:', error);
        res.status(500).json({ error: 'Failed to update theory' });
    }
};
exports.updateTheory = updateTheory;
const updateTheoryStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (typeof id !== 'string' || !['ACTIVE', 'INACTIVE'].includes(status)) {
        res.status(400).json({ error: 'Invalid ID or status value' });
        return;
    }
    try {
        const theory = await db_1.default.theory.update({ where: { id }, data: { status } });
        res.json(theory);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update theory status' });
    }
};
exports.updateTheoryStatus = updateTheoryStatus;
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
const getModel3DTypes = async (req, res) => {
    try {
        const types = await db_1.default.model3D.findMany({
            select: { type: true },
            distinct: ['type'],
        });
        const typeList = types.map(t => t.type).filter(Boolean);
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
        const { type, search } = req.query;
        let whereClause = {};
        if (type && typeof type === 'string') {
            whereClause.type = type;
        }
        if (search && typeof search === 'string') {
            whereClause.name = { contains: search, mode: 'insensitive' };
        }
        const models = await db_1.default.model3D.findMany({
            where: whereClause,
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
const updateModel3DStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (typeof id !== 'string' || !['ACTIVE', 'INACTIVE'].includes(status)) {
        res.status(400).json({ error: 'Invalid ID or status value' });
        return;
    }
    try {
        const model = await db_1.default.model3D.update({ where: { id }, data: { status } });
        res.json(model);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update model status' });
    }
};
exports.updateModel3DStatus = updateModel3DStatus;
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
const getExampleTypes = async (req, res) => {
    try {
        const types = await db_1.default.example.findMany({ select: { example_type_name: true }, distinct: ['example_type_name'] });
        res.json(types.map(t => t.example_type_name).filter(Boolean));
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch example types' });
    }
};
exports.getExampleTypes = getExampleTypes;
const getExamples = async (req, res) => {
    try {
        const { type, example_type_name, search } = req.query;
        let whereClause = {};
        if (type && typeof type === 'string')
            whereClause.type = type;
        if (example_type_name && typeof example_type_name === 'string')
            whereClause.example_type_name = example_type_name;
        if (search && typeof search === 'string')
            whereClause.title = { contains: search, mode: 'insensitive' };
        const examples = await db_1.default.example.findMany({
            where: whereClause,
            include: { lesson: true },
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
    const { lesson_id, title, problem, solution, type, example_type_name, status, reference } = req.body;
    try {
        const example = await db_1.default.example.create({
            data: { lesson_id, title, problem, solution, type, example_type_name, status, reference }
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
    const { title, problem, solution, type, example_type_name, status, reference } = req.body;
    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    try {
        const example = await db_1.default.example.update({
            where: { id },
            data: { title, problem, solution, type, example_type_name, status, reference }
        });
        res.json(example);
    }
    catch (error) {
        console.error('Error updating example:', error);
        res.status(500).json({ error: 'Failed to update example' });
    }
};
exports.updateExample = updateExample;
const updateExampleStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (typeof id !== 'string' || !['ACTIVE', 'INACTIVE'].includes(status)) {
        res.status(400).json({ error: 'Invalid ID or status value' });
        return;
    }
    try {
        const example = await db_1.default.example.update({ where: { id }, data: { status } });
        res.json(example);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update example status' });
    }
};
exports.updateExampleStatus = updateExampleStatus;
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
const getExerciseTypes = async (req, res) => {
    try {
        const types = await db_1.default.exercise.findMany({ select: { exercise_type_name: true }, distinct: ['exercise_type_name'] });
        res.json(types.map(t => t.exercise_type_name).filter(Boolean));
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch exercise types' });
    }
};
exports.getExerciseTypes = getExerciseTypes;
const getExercises = async (req, res) => {
    try {
        const { type, exercise_type_name, search } = req.query;
        let whereClause = {};
        if (type && typeof type === 'string')
            whereClause.type = type;
        if (exercise_type_name && typeof exercise_type_name === 'string')
            whereClause.exercise_type_name = exercise_type_name;
        if (search && typeof search === 'string')
            whereClause.question = { contains: search, mode: 'insensitive' };
        const exercises = await db_1.default.exercise.findMany({
            where: whereClause,
            include: { lesson: true },
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
    const { lesson_id, question, options, correct_answer, level, type, exercise_type_name, status, reference, solution } = req.body;
    try {
        const exercise = await db_1.default.exercise.create({
            data: {
                lesson_id,
                question,
                options: typeof options === 'string' ? JSON.parse(options) : options,
                correct_answer,
                level,
                type,
                exercise_type_name,
                status,
                reference,
                solution
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
    const { question, options, correct_answer, level, type, status, reference, solution } = req.body;
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
                reference,
                solution
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
const updateExerciseStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (typeof id !== 'string' || !['ACTIVE', 'INACTIVE'].includes(status)) {
        res.status(400).json({ error: 'Invalid ID or status value' });
        return;
    }
    try {
        const exercise = await db_1.default.exercise.update({ where: { id }, data: { status } });
        res.json(exercise);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update exercise status' });
    }
};
exports.updateExerciseStatus = updateExerciseStatus;
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