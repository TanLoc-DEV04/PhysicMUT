import { Request, Response } from 'express';
import prisma from '../config/db';

type Status = 'ACTIVE' | 'INACTIVE';

// --- MODELS 3D (The Root Entity) ---

export const getModel3DTypes = async (req: Request, res: Response) => {
    try {
        const types = await prisma.model3D.findMany({
            select: { model_type_name: true },
            orderBy: { model_type_name: 'asc' }
        });
        const typeList = types.map(t => t.model_type_name).filter(Boolean);
        res.json(typeList);
    } catch (error) {
        console.error('Error fetching model 3d types:', error);
        res.status(500).json({ error: 'Failed to fetch model 3d types' });
    }
}

export const getModels3D = async (req: Request, res: Response) => {
    try {
        const { model_type_name, search } = req.query;
        let whereClause: any = {};

        // Filter by exact model_type_name (case-insensitive contains for dropdown filter)
        if (model_type_name && typeof model_type_name === 'string') {
            whereClause.model_type_name = { contains: model_type_name as string, mode: 'insensitive' };
        }

        if (search && typeof search === 'string') {
            const searchStr = search as string;
            whereClause.OR = [
                { name: { contains: searchStr, mode: 'insensitive' } },
                { model_type_name: { contains: searchStr, mode: 'insensitive' } }
            ];
        }

        const models = await prisma.model3D.findMany({
            where: whereClause,
            include: {
                theories: { where: { status: 'ACTIVE' } },
                examples: { where: { status: 'ACTIVE' } },
                exercises: { where: { status: 'ACTIVE' } }
            },
            orderBy: { created_at: 'desc' }
        });
        res.json(models);
    } catch (error) {
        console.error('Error fetching models:', error);
        res.status(500).json({ error: 'Failed to fetch 3D models' });
    }
}

export const getModel3DByTypeName = async (req: Request, res: Response) => {
    const { typeName } = req.params;
    try {
        const model = await prisma.model3D.findUnique({
            where: { model_type_name: typeName as string },
            include: {
                theories: { where: { status: 'ACTIVE' } },
                examples: { where: { status: 'ACTIVE' } },
                exercises: { where: { status: 'ACTIVE' } }
            }
        });
        if (!model) {
            res.status(404).json({ error: 'Model not found' });
            return;
        }
        res.json(model);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch model details' });
    }
}

export const createModel3D = async (req: Request, res: Response) => {
  const { model_type_name, name, description, status } = req.body;
  
  if (!model_type_name) {
    res.status(400).json({ error: 'Model Type Name is required' });
    return;
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  let source_url = (req.body.source_url as string) || files?.['source']?.[0]?.path.replace(/\\/g, '/');
  const thumbnail_url = files?.['thumbnail']?.[0]?.path.replace(/\\/g, '/');

  if (!source_url) {
      source_url = 'uploads/models/placeholder.glb';
  }

  try {
    const model = await prisma.model3D.create({
      data: { 
          model_type_name,
          name, 
          description, 
          source_url, 
          thumbnail_url: thumbnail_url || '',
          status: (status as Status) || 'ACTIVE'
      },
    });
    res.status(201).json(model);
  } catch (error) {
    console.error('Error creating model:', error);
    res.status(500).json({ error: 'Failed to create 3D model' });
  }
};

export const updateModel3D = async (req: Request, res: Response) => {
    const { typeName } = req.params;
    const { name, description, status } = req.body;
    
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const thumbnail_file = files?.['thumbnail']?.[0]?.path.replace(/\\/g, '/');

    try {
        const updateData: any = { 
            name, 
            description, 
            status: status ? (status as Status) : undefined
        };
        if (thumbnail_file) updateData.thumbnail_url = thumbnail_file;

        const model = await prisma.model3D.update({
            where: { model_type_name: typeName as string },
            data: updateData
        });
        res.json(model);
    } catch (error) {
        console.error('Error updating model:', error);
        res.status(500).json({ error: 'Failed to update 3D model' });
    }
};
    
export const updateModel3DStatus = async (req: Request, res: Response) => {
    const { typeName } = req.params;
    const { status } = req.body;
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
        res.status(400).json({ error: 'Invalid status value' });
        return;
    }
    try {
        const model = await prisma.model3D.update({ 
            where: { model_type_name: typeName as string }, 
            data: { status: status as Status } 
        });
        res.json(model);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update model status' });
    }
}

export const deleteModel3D = async (req: Request, res: Response) => {
    const { typeName } = req.params;
    try {
        await prisma.model3D.delete({ where: { model_type_name: typeName as string } });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting model:', error);
        res.status(500).json({ error: 'Failed to delete 3D model' });
    }
}

// --- THEORIES ---

// Categories pulled from Model3D (canonical source); falls back to orphaned theory rows
export const getTheoryCategories = async (req: Request, res: Response) => {
    try {
        const models = await prisma.model3D.findMany({
            select: { model_type_name: true },
            orderBy: { model_type_name: 'asc' }
        });
        const fromModels = models.map(m => m.model_type_name).filter(Boolean);

        // Include orphaned categories (theories whose model was deleted)
        const orphaned = await prisma.theory.findMany({ select: { theory_type_name: true }, distinct: ['theory_type_name'] });
        const orphanedList = orphaned.map(c => c.theory_type_name).filter(v => v && !fromModels.includes(v)) as string[];

        res.json([...fromModels, ...orphanedList]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch theory categories' });
    }
}

export const getTheories = async (req: Request, res: Response) => {
    try {
        const { model_type_name, theory_type_name, search } = req.query;
        let whereClause: any = {};
        if (model_type_name && typeof model_type_name === 'string') whereClause.model_type_name = model_type_name as string;
        if (theory_type_name && typeof theory_type_name === 'string') whereClause.theory_type_name = theory_type_name as string;
        if (search && typeof search === 'string') whereClause.title = { contains: search as string, mode: 'insensitive' };

        const theories = await prisma.theory.findMany({
             where: whereClause,
             include: { model3d: true },
             orderBy: { created_at: 'desc' }
        });
        res.json(theories);
    } catch (error) {
        console.error('Error fetching theories:', error);
        res.status(500).json({ error: 'Failed to fetch theories' });
    }
}

export const createTheory = async (req: Request, res: Response) => {
  const { model_type_name, title, content_html, theory_type_name, status } = req.body;
  try {
    const theory = await prisma.theory.create({
      data: { model_type_name, title, content_html, theory_type_name, status: (status as Status) || 'ACTIVE' },
    });
    res.status(201).json(theory);
  } catch (error) {
    console.error('Error creating theory:', error);
    res.status(500).json({ error: 'Failed to create theory' });
  }
};

export const updateTheory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, content_html, theory_type_name, status } = req.body;
    
    try {
        const theory = await prisma.theory.update({
            where: { id: id as string },
            data: { title, content_html, theory_type_name, status: status ? (status as Status) : undefined }
        });
        res.json(theory);
    } catch (error) {
        console.error('Error updating theory:', error);
        res.status(500).json({ error: 'Failed to update theory' });
    }
}

export const updateTheoryStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
        res.status(400).json({ error: 'Invalid status value' });
        return;
    }
    try {
        const theory = await prisma.theory.update({ 
            where: { id: id as string }, 
            data: { status: status as Status } 
        });
        res.json(theory);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update theory status' });
    }
}

export const deleteTheory = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.theory.delete({ where: { id: id as string } });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting theory:', error);
        res.status(500).json({ error: 'Failed to delete theory' });
    }
}

// --- EXAMPLES ---

// Categories pulled from Model3D (canonical source); falls back to orphaned example rows
export const getExampleCategories = async (req: Request, res: Response) => {
    try {
        const models = await prisma.model3D.findMany({
            select: { model_type_name: true },
            orderBy: { model_type_name: 'asc' }
        });
        const fromModels = models.map(m => m.model_type_name).filter(Boolean);

        const orphaned = await prisma.example.findMany({ select: { example_type_name: true }, distinct: ['example_type_name'] });
        const orphanedList = orphaned.map(c => c.example_type_name).filter(v => v && !fromModels.includes(v)) as string[];

        res.json([...fromModels, ...orphanedList]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch example categories' });
    }
}

export const getExamples = async (req: Request, res: Response) => {
    try {
        const { model_type_name, example_type_name, search } = req.query;
        let whereClause: any = {};
        if (model_type_name && typeof model_type_name === 'string') whereClause.model_type_name = model_type_name as string;
        if (example_type_name && typeof example_type_name === 'string') whereClause.example_type_name = example_type_name as string;
        if (search && typeof search === 'string') whereClause.title = { contains: search as string, mode: 'insensitive' };

        const examples = await prisma.example.findMany({
            where: whereClause,
            include: { model3d: true },
            orderBy: { created_at: 'desc' }
        });
        res.json(examples);
    } catch (error) {
        console.error('Error fetching examples:', error);
        res.status(500).json({ error: 'Failed to fetch examples' });
    }
}

export const createExample = async (req: Request, res: Response) => {
    const { model_type_name, title, problem, solution, example_type_name, status, reference } = req.body;
    try {
        const example = await prisma.example.create({
            data: { model_type_name, title, problem, solution, example_type_name, status: (status as Status) || 'ACTIVE', reference }
        });
        res.status(201).json(example);
    } catch (error) {
        console.error('Error creating example:', error);
        res.status(500).json({ error: 'Failed to create example' });
    }
}

export const updateExample = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, problem, solution, example_type_name, status, reference } = req.body;

    try {
        const example = await prisma.example.update({
            where: { id: id as string },
            data: { title, problem, solution, example_type_name, status: status ? (status as Status) : undefined, reference }
        });
        res.json(example);
    } catch (error) {
        console.error('Error updating example:', error);
        res.status(500).json({ error: 'Failed to update example' });
    }
}

export const updateExampleStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
        res.status(400).json({ error: 'Invalid status value' });
        return;
    }
    try {
        const example = await prisma.example.update({ 
            where: { id: id as string }, 
            data: { status: status as Status } 
        });
        res.json(example);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update example status' });
    }
}

export const deleteExample = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.example.delete({ where: { id: id as string } });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting example:', error);
        res.status(500).json({ error: 'Failed to delete example' });
    }
}

// --- EXERCISES ---

// Categories pulled from Model3D (canonical source); falls back to orphaned exercise rows
export const getExerciseCategories = async (req: Request, res: Response) => {
    try {
        const models = await prisma.model3D.findMany({
            select: { model_type_name: true },
            orderBy: { model_type_name: 'asc' }
        });
        const fromModels = models.map(m => m.model_type_name).filter(Boolean);

        const orphaned = await prisma.exercise.findMany({ select: { exercise_type_name: true }, distinct: ['exercise_type_name'] });
        const orphanedList = orphaned.map(c => c.exercise_type_name).filter(v => v && !fromModels.includes(v)) as string[];

        res.json([...fromModels, ...orphanedList]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch exercise categories' });
    }
}

export const getExerciseTypes = async (req: Request, res: Response) => {
    // Exercise type is fixed: MultipleChoice or Essay — return hardcoded values
    res.json(['MultipleChoice', 'Essay']);
}

export const getExercises = async (req: Request, res: Response) => {
    try {
        const { model_type_name, exercise_type_name, type, search } = req.query;
        let whereClause: any = {};
        if (model_type_name && typeof model_type_name === 'string') whereClause.model_type_name = model_type_name as string;
        if (exercise_type_name && typeof exercise_type_name === 'string') whereClause.exercise_type_name = exercise_type_name as string;
        if (type && typeof type === 'string') whereClause.type = type as string;
        if (search && typeof search === 'string') whereClause.question = { contains: search as string, mode: 'insensitive' };

        const exercises = await prisma.exercise.findMany({
            where: whereClause,
            include: { model3d: true },
            orderBy: { created_at: 'desc' }
        });
        res.json(exercises);
    } catch (error) {
        console.error('Error fetching exercises:', error);
        res.status(500).json({ error: 'Failed to fetch exercises' });
    }
}

export const createExercise = async (req: Request, res: Response) => {
    const { model_type_name, question, options, correct_answer, level, type, exercise_type_name, status, reference, solution } = req.body;
    try {
        const exercise = await prisma.exercise.create({
            data: { 
                model_type_name, 
                question, 
                options: typeof options === 'string' ? JSON.parse(options) : options, 
                correct_answer, 
                level, 
                type, 
                exercise_type_name,
                status: (status as Status) || 'ACTIVE', 
                reference,
                solution
            }
        });
        res.status(201).json(exercise);
    } catch (error) {
        console.error('Error creating exercise:', error);
        res.status(500).json({ error: 'Failed to create exercise' });
    }
}

export const updateExercise = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { question, options, correct_answer, level, type, status, reference, solution } = req.body;

    try {
        const exercise = await prisma.exercise.update({
            where: { id: id as string },
            data: { 
                question, 
                options: typeof options === 'string' ? JSON.parse(options) : options, 
                correct_answer, 
                level, 
                type, 
                status: status ? (status as Status) : undefined, 
                reference,
                solution
            }
        });
        res.json(exercise);
    } catch (error) {
        console.error('Error updating exercise:', error);
        res.status(500).json({ error: 'Failed to update exercise' });
    }
}

export const updateExerciseStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
        res.status(400).json({ error: 'Invalid status value' });
        return;
    }
    try {
        const exercise = await prisma.exercise.update({ 
            where: { id: id as string }, 
            data: { status: status as Status } 
        });
        res.json(exercise);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update exercise status' });
    }
}

export const deleteExercise = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.exercise.delete({ where: { id: id as string } });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting exercise:', error);
        res.status(500).json({ error: 'Failed to delete exercise' });
    }
}
