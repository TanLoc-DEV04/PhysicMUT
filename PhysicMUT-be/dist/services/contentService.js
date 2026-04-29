"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExercise = exports.updateExerciseStatus = exports.updateExercise = exports.createExercise = exports.getExercises = exports.getExerciseTypes = exports.getExerciseCategories = exports.deleteExample = exports.updateExampleStatus = exports.updateExample = exports.createExample = exports.getExamples = exports.getExampleCategories = exports.deleteTheory = exports.updateTheoryStatus = exports.updateTheory = exports.createTheory = exports.getTheories = exports.getTheoryCategories = exports.deleteModel3D = exports.updateModel3DStatus = exports.updateModel3D = exports.createModel3D = exports.getModel3DByTypeName = exports.getModels3D = exports.getModel3DTypes = void 0;
const db_1 = __importDefault(require("../config/db"));
// --- MODELS 3D ---
const getModel3DTypes = async () => {
    const types = await db_1.default.model3D.findMany({
        select: { model_type_name: true },
        orderBy: { model_type_name: 'asc' }
    });
    return types.map(t => t.model_type_name).filter(Boolean);
};
exports.getModel3DTypes = getModel3DTypes;
const getModels3D = async (filters) => {
    let whereClause = {};
    if (filters.model_type_name) {
        whereClause.model_type_name = { contains: filters.model_type_name, mode: 'insensitive' };
    }
    if (filters.search) {
        whereClause.OR = [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { model_type_name: { contains: filters.search, mode: 'insensitive' } }
        ];
    }
    return await db_1.default.model3D.findMany({
        where: whereClause,
        include: {
            theories: { where: { status: 'ACTIVE' } },
            examples: { where: { status: 'ACTIVE' } },
            exercises: { where: { status: 'ACTIVE' } }
        },
        orderBy: { created_at: 'desc' }
    });
};
exports.getModels3D = getModels3D;
const getModel3DByTypeName = async (typeName) => {
    return await db_1.default.model3D.findUnique({
        where: { model_type_name: typeName },
        include: {
            theories: { where: { status: 'ACTIVE' } },
            examples: { where: { status: 'ACTIVE' } },
            exercises: { where: { status: 'ACTIVE' } }
        }
    });
};
exports.getModel3DByTypeName = getModel3DByTypeName;
const createModel3D = async (data, files) => {
    let source_url = data.source_url || files?.['source']?.[0]?.path.replace(/\\/g, '/');
    const thumbnail_url = files?.['thumbnail']?.[0]?.path.replace(/\\/g, '/');
    if (!source_url) {
        source_url = 'uploads/models/placeholder.glb';
    }
    return await db_1.default.model3D.create({
        data: {
            model_type_name: data.model_type_name,
            name: data.name,
            description: data.description,
            source_url,
            thumbnail_url: thumbnail_url || '',
            status: data.status || 'ACTIVE'
        },
    });
};
exports.createModel3D = createModel3D;
const updateModel3D = async (typeName, data, files) => {
    const thumbnail_file = files?.['thumbnail']?.[0]?.path.replace(/\\/g, '/');
    const updateData = {
        name: data.name,
        description: data.description,
        status: data.status ? data.status : undefined
    };
    if (thumbnail_file)
        updateData.thumbnail_url = thumbnail_file;
    return await db_1.default.model3D.update({
        where: { model_type_name: typeName },
        data: updateData
    });
};
exports.updateModel3D = updateModel3D;
const updateModel3DStatus = async (typeName, status) => {
    return await db_1.default.model3D.update({
        where: { model_type_name: typeName },
        data: { status }
    });
};
exports.updateModel3DStatus = updateModel3DStatus;
const deleteModel3D = async (typeName) => {
    return await db_1.default.model3D.delete({ where: { model_type_name: typeName } });
};
exports.deleteModel3D = deleteModel3D;
// --- THEORIES ---
const getTheoryCategories = async () => {
    const models = await db_1.default.model3D.findMany({
        select: { model_type_name: true },
        orderBy: { model_type_name: 'asc' }
    });
    const fromModels = models.map(m => m.model_type_name).filter(Boolean);
    const orphaned = await db_1.default.theory.findMany({ select: { theory_type_name: true }, distinct: ['theory_type_name'] });
    const orphanedList = orphaned.map(c => c.theory_type_name).filter(v => v && !fromModels.includes(v));
    return [...fromModels, ...orphanedList];
};
exports.getTheoryCategories = getTheoryCategories;
const getTheories = async (filters) => {
    let whereClause = {};
    if (filters.model_type_name)
        whereClause.model_type_name = filters.model_type_name;
    if (filters.theory_type_name)
        whereClause.theory_type_name = filters.theory_type_name;
    if (filters.search)
        whereClause.title = { contains: filters.search, mode: 'insensitive' };
    return await db_1.default.theory.findMany({
        where: whereClause,
        include: { model3d: true },
        orderBy: { created_at: 'desc' }
    });
};
exports.getTheories = getTheories;
const createTheory = async (data) => {
    return await db_1.default.theory.create({
        data: { model_type_name: data.model_type_name, title: data.title, content_html: data.content_html, theory_type_name: data.theory_type_name, status: data.status || 'ACTIVE' },
    });
};
exports.createTheory = createTheory;
const updateTheory = async (id, data) => {
    return await db_1.default.theory.update({
        where: { id },
        data: { title: data.title, content_html: data.content_html, theory_type_name: data.theory_type_name, status: data.status ? data.status : undefined }
    });
};
exports.updateTheory = updateTheory;
const updateTheoryStatus = async (id, status) => {
    return await db_1.default.theory.update({ where: { id }, data: { status } });
};
exports.updateTheoryStatus = updateTheoryStatus;
const deleteTheory = async (id) => {
    return await db_1.default.theory.delete({ where: { id } });
};
exports.deleteTheory = deleteTheory;
// --- EXAMPLES ---
const getExampleCategories = async () => {
    const models = await db_1.default.model3D.findMany({
        select: { model_type_name: true },
        orderBy: { model_type_name: 'asc' }
    });
    const fromModels = models.map(m => m.model_type_name).filter(Boolean);
    const orphaned = await db_1.default.example.findMany({ select: { example_type_name: true }, distinct: ['example_type_name'] });
    const orphanedList = orphaned.map(c => c.example_type_name).filter(v => v && !fromModels.includes(v));
    return [...fromModels, ...orphanedList];
};
exports.getExampleCategories = getExampleCategories;
const getExamples = async (filters) => {
    let whereClause = {};
    if (filters.model_type_name)
        whereClause.model_type_name = filters.model_type_name;
    if (filters.example_type_name)
        whereClause.example_type_name = filters.example_type_name;
    if (filters.search)
        whereClause.title = { contains: filters.search, mode: 'insensitive' };
    return await db_1.default.example.findMany({
        where: whereClause,
        include: { model3d: true },
        orderBy: { created_at: 'desc' }
    });
};
exports.getExamples = getExamples;
const createExample = async (data) => {
    return await db_1.default.example.create({
        data: { model_type_name: data.model_type_name, title: data.title, problem: data.problem, solution: data.solution, example_type_name: data.example_type_name, status: data.status || 'ACTIVE', reference: data.reference }
    });
};
exports.createExample = createExample;
const updateExample = async (id, data) => {
    return await db_1.default.example.update({
        where: { id },
        data: { title: data.title, problem: data.problem, solution: data.solution, example_type_name: data.example_type_name, status: data.status ? data.status : undefined, reference: data.reference }
    });
};
exports.updateExample = updateExample;
const updateExampleStatus = async (id, status) => {
    return await db_1.default.example.update({ where: { id }, data: { status } });
};
exports.updateExampleStatus = updateExampleStatus;
const deleteExample = async (id) => {
    return await db_1.default.example.delete({ where: { id } });
};
exports.deleteExample = deleteExample;
// --- EXERCISES ---
const getExerciseCategories = async () => {
    const models = await db_1.default.model3D.findMany({
        select: { model_type_name: true },
        orderBy: { model_type_name: 'asc' }
    });
    const fromModels = models.map(m => m.model_type_name).filter(Boolean);
    const orphaned = await db_1.default.exercise.findMany({ select: { exercise_type_name: true }, distinct: ['exercise_type_name'] });
    const orphanedList = orphaned.map(c => c.exercise_type_name).filter(v => v && !fromModels.includes(v));
    return [...fromModels, ...orphanedList];
};
exports.getExerciseCategories = getExerciseCategories;
const getExerciseTypes = async () => {
    return ['MultipleChoice', 'Essay'];
};
exports.getExerciseTypes = getExerciseTypes;
const getExercises = async (filters) => {
    let whereClause = {};
    if (filters.model_type_name)
        whereClause.model_type_name = filters.model_type_name;
    if (filters.exercise_type_name)
        whereClause.exercise_type_name = filters.exercise_type_name;
    if (filters.type)
        whereClause.type = filters.type;
    if (filters.search)
        whereClause.question = { contains: filters.search, mode: 'insensitive' };
    return await db_1.default.exercise.findMany({
        where: whereClause,
        include: { model3d: true },
        orderBy: { created_at: 'desc' }
    });
};
exports.getExercises = getExercises;
const createExercise = async (data) => {
    return await db_1.default.exercise.create({
        data: {
            model_type_name: data.model_type_name,
            question: data.question,
            options: typeof data.options === 'string' ? JSON.parse(data.options) : data.options,
            correct_answer: data.correct_answer,
            level: data.level,
            type: data.type,
            exercise_type_name: data.exercise_type_name,
            status: data.status || 'ACTIVE',
            reference: data.reference,
            solution: data.solution
        }
    });
};
exports.createExercise = createExercise;
const updateExercise = async (id, data) => {
    return await db_1.default.exercise.update({
        where: { id },
        data: {
            question: data.question,
            options: typeof data.options === 'string' ? JSON.parse(data.options) : data.options,
            correct_answer: data.correct_answer,
            level: data.level,
            type: data.type,
            status: data.status ? data.status : undefined,
            reference: data.reference,
            solution: data.solution
        }
    });
};
exports.updateExercise = updateExercise;
const updateExerciseStatus = async (id, status) => {
    return await db_1.default.exercise.update({ where: { id }, data: { status } });
};
exports.updateExerciseStatus = updateExerciseStatus;
const deleteExercise = async (id) => {
    return await db_1.default.exercise.delete({ where: { id } });
};
exports.deleteExercise = deleteExercise;
//# sourceMappingURL=contentService.js.map