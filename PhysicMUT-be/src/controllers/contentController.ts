import { Request, Response } from 'express';
import prisma from '../config/db';

// --- CHAPTERS ---

export const getChapters = async (req: Request, res: Response) => {
  try {
    const chapters = await prisma.chapter.findMany({
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
};

export const createChapter = async (req: Request, res: Response) => {
  const { name, description, order } = req.body;
  try {
    const chapter = await prisma.chapter.create({
      data: { name, description, order },
    });
    res.status(201).json(chapter);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create chapter' });
  }
};

// --- LESSONS ---

export const getLessonById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (typeof id !== 'string') {
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }
  try {
    const lesson = await prisma.lesson.findUnique({
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
};

export const createLesson = async (req: Request, res: Response) => {
  const { name, chapter_id, order } = req.body;
  try {
    const lesson = await prisma.lesson.create({
      data: { name, chapter_id, order },
    });
    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lesson' });
  }
};

// --- CONTENT (Theories, Models) ---

// THEORIES
export const getTheories = async (req: Request, res: Response) => {
    try {
        const theories = await prisma.theory.findMany({
             orderBy: { created_at: 'desc' }
        });
        res.json(theories);
    } catch (error) {
        console.error('Error fetching theories:', error);
        res.status(500).json({ error: 'Failed to fetch theories' });
    }
}

export const createTheory = async (req: Request, res: Response) => {
  const { lesson_id, title, content_html, type, status } = req.body;
  try {
    const theory = await prisma.theory.create({
      data: { lesson_id, title, content_html, type, status },
    });
    res.status(201).json(theory);
  } catch (error) {
    console.error('Error creating theory:', error);
    res.status(500).json({ error: 'Failed to create theory' });
  }
};

export const updateTheory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, content_html, type, status } = req.body;
    
    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }

    try {
        const theory = await prisma.theory.update({
            where: { id },
            data: { title, content_html, type, status }
        });
        res.json(theory);
    } catch (error) {
        console.error('Error updating theory:', error);
        res.status(500).json({ error: 'Failed to update theory' });
    }
}

export const deleteTheory = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }

    try {
        await prisma.theory.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting theory:', error);
        res.status(500).json({ error: 'Failed to delete theory' });
    }
}

// MODELS 3D
export const getModels3D = async (req: Request, res: Response) => {
    try {
        const models = await prisma.model3D.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json(models);
    } catch (error) {
        console.error('Error fetching models:', error);
        res.status(500).json({ error: 'Failed to fetch 3D models' });
    }
}

export const createModel3D = async (req: Request, res: Response) => {
  const { lesson_id, name, description, type, status } = req.body;
  
  // Handle file uploads
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const source_url = files?.['source']?.[0]?.path.replace(/\\/g, '/');
  const thumbnail_url = files?.['thumbnail']?.[0]?.path.replace(/\\/g, '/');

  if (!source_url) {
      res.status(400).json({ error: 'Source file (GLB/GLTF) is required' });
      return;
  }

  try {
    const model = await prisma.model3D.create({
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
  } catch (error) {
    console.error('Error creating model:', error);
    res.status(500).json({ error: 'Failed to create 3D model' });
  }
};

export const updateModel3D = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, type, status } = req.body;
    
    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }

    // Handle file uploads
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const source_url = files?.['source']?.[0]?.path.replace(/\\/g, '/');
    const thumbnail_url = files?.['thumbnail']?.[0]?.path.replace(/\\/g, '/');

    const updateData: any = { name, description, type, status };
    if (source_url) updateData.source_url = source_url;
    if (thumbnail_url) updateData.thumbnail_url = thumbnail_url;

    try {
        const model = await prisma.model3D.update({
            where: { id },
            data: updateData
        });
        res.json(model);
    } catch (error) {
        console.error('Error updating model:', error);
        res.status(500).json({ error: 'Failed to update 3D model' });
    }
}

export const deleteModel3D = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }

    try {
        await prisma.model3D.delete({ where: { id } });
        // TODO: Delete physical files
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting model:', error);
        res.status(500).json({ error: 'Failed to delete 3D model' });
    }
}


// EXAMPLES
export const getExamples = async (req: Request, res: Response) => {
    try {
        const examples = await prisma.example.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json(examples);
    } catch (error) {
        console.error('Error fetching examples:', error);
        res.status(500).json({ error: 'Failed to fetch examples' });
    }
}

export const createExample = async (req: Request, res: Response) => {
    const { lesson_id, title, problem, solution, type, status, reference } = req.body;
    try {
        const example = await prisma.example.create({
            data: { lesson_id, title, problem, solution, type, status, reference }
        });
        res.status(201).json(example);
    } catch (error) {
        console.error('Error creating example:', error);
        res.status(500).json({ error: 'Failed to create example' });
    }
}

export const updateExample = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, problem, solution, type, status, reference } = req.body;

    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }

    try {
        const example = await prisma.example.update({
            where: { id },
            data: { title, problem, solution, type, status, reference }
        });
        res.json(example);
    } catch (error) {
        console.error('Error updating example:', error);
        res.status(500).json({ error: 'Failed to update example' });
    }
}

export const deleteExample = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }

    try {
        await prisma.example.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting example:', error);
        res.status(500).json({ error: 'Failed to delete example' });
    }
}

// EXERCISES
export const getExercises = async (req: Request, res: Response) => {
    try {
        const exercises = await prisma.exercise.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json(exercises);
    } catch (error) {
        console.error('Error fetching exercises:', error);
        res.status(500).json({ error: 'Failed to fetch exercises' });
    }
}

export const createExercise = async (req: Request, res: Response) => {
    const { lesson_id, question, options, correct_answer, level, type, status, reference } = req.body;
    try {
        const exercise = await prisma.exercise.create({
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
    } catch (error) {
        console.error('Error creating exercise:', error);
        res.status(500).json({ error: 'Failed to create exercise' });
    }
}

export const updateExercise = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { question, options, correct_answer, level, type, status, reference } = req.body;

    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }

    try {
        const exercise = await prisma.exercise.update({
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
    } catch (error) {
        console.error('Error updating exercise:', error);
        res.status(500).json({ error: 'Failed to update exercise' });
    }
}

export const deleteExercise = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }

    try {
        await prisma.exercise.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting exercise:', error);
        res.status(500).json({ error: 'Failed to delete exercise' });
    }
}
