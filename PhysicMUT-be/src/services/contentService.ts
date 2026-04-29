import prisma from '../config/db';

type Status = 'ACTIVE' | 'INACTIVE';

// --- MODELS 3D ---
export const getModel3DTypes = async () => {
    const types = await prisma.model3D.findMany({
        select: { model_type_name: true },
        orderBy: { model_type_name: 'asc' }
    });
    return types.map(t => t.model_type_name).filter(Boolean);
};

export const getModels3D = async (filters: { model_type_name?: string, search?: string }) => {
    let whereClause: any = {};
    if (filters.model_type_name) {
        whereClause.model_type_name = { contains: filters.model_type_name, mode: 'insensitive' };
    }
    if (filters.search) {
        whereClause.OR = [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { model_type_name: { contains: filters.search, mode: 'insensitive' } }
        ];
    }
    return await prisma.model3D.findMany({
        where: whereClause,
        include: {
            theories: { where: { status: 'ACTIVE' } },
            examples: { where: { status: 'ACTIVE' } },
            exercises: { where: { status: 'ACTIVE' } }
        },
        orderBy: { created_at: 'desc' }
    });
};

export const getModel3DByTypeName = async (typeName: string) => {
    return await prisma.model3D.findUnique({
        where: { model_type_name: typeName },
        include: {
            theories: { where: { status: 'ACTIVE' } },
            examples: { where: { status: 'ACTIVE' } },
            exercises: { where: { status: 'ACTIVE' } }
        }
    });
};

export const createModel3D = async (data: any, files?: any) => {
    let source_url = data.source_url || files?.['source']?.[0]?.path.replace(/\\/g, '/');
    const thumbnail_url = files?.['thumbnail']?.[0]?.path.replace(/\\/g, '/');

    if (!source_url) {
        source_url = 'uploads/models/placeholder.glb';
    }

    return await prisma.model3D.create({
        data: { 
            model_type_name: data.model_type_name,
            name: data.name, 
            description: data.description, 
            source_url, 
            thumbnail_url: thumbnail_url || '',
            status: (data.status as Status) || 'ACTIVE'
        },
    });
};

export const updateModel3D = async (typeName: string, data: any, files?: any) => {
    const thumbnail_file = files?.['thumbnail']?.[0]?.path.replace(/\\/g, '/');
    const updateData: any = { 
        name: data.name, 
        description: data.description, 
        status: data.status ? (data.status as Status) : undefined
    };
    if (thumbnail_file) updateData.thumbnail_url = thumbnail_file;

    return await prisma.model3D.update({
        where: { model_type_name: typeName },
        data: updateData
    });
};

export const updateModel3DStatus = async (typeName: string, status: Status) => {
    return await prisma.model3D.update({ 
        where: { model_type_name: typeName }, 
        data: { status } 
    });
};

export const deleteModel3D = async (typeName: string) => {
    return await prisma.model3D.delete({ where: { model_type_name: typeName } });
};

// --- THEORIES ---
export const getTheoryCategories = async () => {
    const models = await prisma.model3D.findMany({
        select: { model_type_name: true },
        orderBy: { model_type_name: 'asc' }
    });
    const fromModels = models.map(m => m.model_type_name).filter(Boolean);

    const orphaned = await prisma.theory.findMany({ select: { theory_type_name: true }, distinct: ['theory_type_name'] });
    const orphanedList = orphaned.map(c => c.theory_type_name).filter(v => v && !fromModels.includes(v)) as string[];

    return [...fromModels, ...orphanedList];
};

export const getTheories = async (filters: { model_type_name?: string, theory_type_name?: string, search?: string }) => {
    let whereClause: any = {};
    if (filters.model_type_name) whereClause.model_type_name = filters.model_type_name;
    if (filters.theory_type_name) whereClause.theory_type_name = filters.theory_type_name;
    if (filters.search) whereClause.title = { contains: filters.search, mode: 'insensitive' };

    return await prisma.theory.findMany({
         where: whereClause,
         include: { model3d: true },
         orderBy: { created_at: 'desc' }
    });
};

export const createTheory = async (data: any) => {
    return await prisma.theory.create({
      data: { model_type_name: data.model_type_name, title: data.title, content_html: data.content_html, theory_type_name: data.theory_type_name, status: (data.status as Status) || 'ACTIVE' },
    });
};

export const updateTheory = async (id: string, data: any) => {
    return await prisma.theory.update({
        where: { id },
        data: { title: data.title, content_html: data.content_html, theory_type_name: data.theory_type_name, status: data.status ? (data.status as Status) : undefined }
    });
};

export const updateTheoryStatus = async (id: string, status: Status) => {
    return await prisma.theory.update({ where: { id }, data: { status } });
};

export const deleteTheory = async (id: string) => {
    return await prisma.theory.delete({ where: { id } });
};

// --- EXAMPLES ---
export const getExampleCategories = async () => {
    const models = await prisma.model3D.findMany({
        select: { model_type_name: true },
        orderBy: { model_type_name: 'asc' }
    });
    const fromModels = models.map(m => m.model_type_name).filter(Boolean);

    const orphaned = await prisma.example.findMany({ select: { example_type_name: true }, distinct: ['example_type_name'] });
    const orphanedList = orphaned.map(c => c.example_type_name).filter(v => v && !fromModels.includes(v)) as string[];

    return [...fromModels, ...orphanedList];
};

export const getExamples = async (filters: { model_type_name?: string, example_type_name?: string, search?: string }) => {
    let whereClause: any = {};
    if (filters.model_type_name) whereClause.model_type_name = filters.model_type_name;
    if (filters.example_type_name) whereClause.example_type_name = filters.example_type_name;
    if (filters.search) whereClause.title = { contains: filters.search, mode: 'insensitive' };

    return await prisma.example.findMany({
        where: whereClause,
        include: { model3d: true },
        orderBy: { created_at: 'desc' }
    });
};

export const createExample = async (data: any) => {
    return await prisma.example.create({
        data: { model_type_name: data.model_type_name, title: data.title, problem: data.problem, solution: data.solution, example_type_name: data.example_type_name, status: (data.status as Status) || 'ACTIVE', reference: data.reference }
    });
};

export const updateExample = async (id: string, data: any) => {
    return await prisma.example.update({
        where: { id },
        data: { title: data.title, problem: data.problem, solution: data.solution, example_type_name: data.example_type_name, status: data.status ? (data.status as Status) : undefined, reference: data.reference }
    });
};

export const updateExampleStatus = async (id: string, status: Status) => {
    return await prisma.example.update({ where: { id }, data: { status } });
};

export const deleteExample = async (id: string) => {
    return await prisma.example.delete({ where: { id } });
};

// --- EXERCISES ---
export const getExerciseCategories = async () => {
    const models = await prisma.model3D.findMany({
        select: { model_type_name: true },
        orderBy: { model_type_name: 'asc' }
    });
    const fromModels = models.map(m => m.model_type_name).filter(Boolean);

    const orphaned = await prisma.exercise.findMany({ select: { exercise_type_name: true }, distinct: ['exercise_type_name'] });
    const orphanedList = orphaned.map(c => c.exercise_type_name).filter(v => v && !fromModels.includes(v)) as string[];

    return [...fromModels, ...orphanedList];
};

export const getExerciseTypes = async () => {
    return ['MultipleChoice', 'Essay'];
};

export const getExercises = async (filters: { model_type_name?: string, exercise_type_name?: string, type?: string, search?: string }) => {
    let whereClause: any = {};
    if (filters.model_type_name) whereClause.model_type_name = filters.model_type_name;
    if (filters.exercise_type_name) whereClause.exercise_type_name = filters.exercise_type_name;
    if (filters.type) whereClause.type = filters.type;
    if (filters.search) whereClause.question = { contains: filters.search, mode: 'insensitive' };

    return await prisma.exercise.findMany({
        where: whereClause,
        include: { model3d: true },
        orderBy: { created_at: 'desc' }
    });
};

export const createExercise = async (data: any) => {
    return await prisma.exercise.create({
        data: { 
            model_type_name: data.model_type_name, 
            question: data.question, 
            options: typeof data.options === 'string' ? JSON.parse(data.options) : data.options, 
            correct_answer: data.correct_answer, 
            level: data.level, 
            type: data.type, 
            exercise_type_name: data.exercise_type_name,
            status: (data.status as Status) || 'ACTIVE', 
            reference: data.reference,
            solution: data.solution
        }
    });
};

export const updateExercise = async (id: string, data: any) => {
    return await prisma.exercise.update({
        where: { id },
        data: { 
            question: data.question, 
            options: typeof data.options === 'string' ? JSON.parse(data.options) : data.options, 
            correct_answer: data.correct_answer, 
            level: data.level, 
            type: data.type, 
            status: data.status ? (data.status as Status) : undefined, 
            reference: data.reference,
            solution: data.solution
        }
    });
};

export const updateExerciseStatus = async (id: string, status: Status) => {
    return await prisma.exercise.update({ where: { id }, data: { status } });
};

export const deleteExercise = async (id: string) => {
    return await prisma.exercise.delete({ where: { id } });
};
