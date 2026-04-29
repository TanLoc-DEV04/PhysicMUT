import { Request, Response } from 'express';
import * as contentService from '../services/contentService';

type Status = 'ACTIVE' | 'INACTIVE';

export const getModel3DTypes = async (req: Request, res: Response) => {
    try {
        const typeList = await contentService.getModel3DTypes();
        res.json(typeList);
    } catch (error) {
        console.error('Error fetching model 3d types:', error);
        res.status(500).json({ error: 'Failed to fetch model 3d types' });
    }
}

export const getModels3D = async (req: Request, res: Response) => {
    try {
        const models = await contentService.getModels3D({
            model_type_name: req.query.model_type_name as string,
            search: req.query.search as string
        });
        res.json(models);
    } catch (error) {
        console.error('Error fetching models:', error);
        res.status(500).json({ error: 'Failed to fetch 3D models' });
    }
}

export const getModel3DByTypeName = async (req: Request, res: Response) => {
    try {
        const model = await contentService.getModel3DByTypeName(req.params.typeName as string);
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
  try {
    const model = await contentService.createModel3D(req.body, req.files);
    res.status(201).json(model);
  } catch (error) {
    console.error('Error creating model:', error);
    res.status(500).json({ error: 'Failed to create 3D model' });
  }
};

export const updateModel3D = async (req: Request, res: Response) => {
    try {
        const model = await contentService.updateModel3D(req.params.typeName as string, req.body, req.files);
        res.json(model);
    } catch (error) {
        console.error('Error updating model:', error);
        res.status(500).json({ error: 'Failed to update 3D model' });
    }
};
    
export const updateModel3DStatus = async (req: Request, res: Response) => {
    try {
        const model = await contentService.updateModel3DStatus(req.params.typeName as string, req.body.status as Status);
        res.json(model);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update model status' });
    }
}

export const deleteModel3D = async (req: Request, res: Response) => {
    try {
        await contentService.deleteModel3D(req.params.typeName as string);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting model:', error);
        res.status(500).json({ error: 'Failed to delete 3D model' });
    }
}

// --- THEORIES ---
export const getTheoryCategories = async (req: Request, res: Response) => {
    try {
        const categories = await contentService.getTheoryCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch theory categories' });
    }
}

export const getTheories = async (req: Request, res: Response) => {
    try {
        const theories = await contentService.getTheories({
            model_type_name: req.query.model_type_name as string,
            theory_type_name: req.query.theory_type_name as string,
            search: req.query.search as string
        });
        res.json(theories);
    } catch (error) {
        console.error('Error fetching theories:', error);
        res.status(500).json({ error: 'Failed to fetch theories' });
    }
}

export const createTheory = async (req: Request, res: Response) => {
  try {
    const theory = await contentService.createTheory(req.body);
    res.status(201).json(theory);
  } catch (error) {
    console.error('Error creating theory:', error);
    res.status(500).json({ error: 'Failed to create theory' });
  }
};

export const updateTheory = async (req: Request, res: Response) => {
    try {
        const theory = await contentService.updateTheory(req.params.id as string, req.body);
        res.json(theory);
    } catch (error) {
        console.error('Error updating theory:', error);
        res.status(500).json({ error: 'Failed to update theory' });
    }
}

export const updateTheoryStatus = async (req: Request, res: Response) => {
    try {
        const theory = await contentService.updateTheoryStatus(req.params.id as string, req.body.status as Status);
        res.json(theory);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update theory status' });
    }
}

export const deleteTheory = async (req: Request, res: Response) => {
    try {
        await contentService.deleteTheory(req.params.id as string);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting theory:', error);
        res.status(500).json({ error: 'Failed to delete theory' });
    }
}

// --- EXAMPLES ---
export const getExampleCategories = async (req: Request, res: Response) => {
    try {
        const categories = await contentService.getExampleCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch example categories' });
    }
}

export const getExamples = async (req: Request, res: Response) => {
    try {
        const examples = await contentService.getExamples({
            model_type_name: req.query.model_type_name as string,
            example_type_name: req.query.example_type_name as string,
            search: req.query.search as string
        });
        res.json(examples);
    } catch (error) {
        console.error('Error fetching examples:', error);
        res.status(500).json({ error: 'Failed to fetch examples' });
    }
}

export const createExample = async (req: Request, res: Response) => {
    try {
        const example = await contentService.createExample(req.body);
        res.status(201).json(example);
    } catch (error) {
        console.error('Error creating example:', error);
        res.status(500).json({ error: 'Failed to create example' });
    }
}

export const updateExample = async (req: Request, res: Response) => {
    try {
        const example = await contentService.updateExample(req.params.id as string, req.body);
        res.json(example);
    } catch (error) {
        console.error('Error updating example:', error);
        res.status(500).json({ error: 'Failed to update example' });
    }
}

export const updateExampleStatus = async (req: Request, res: Response) => {
    try {
        const example = await contentService.updateExampleStatus(req.params.id as string, req.body.status as Status);
        res.json(example);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update example status' });
    }
}

export const deleteExample = async (req: Request, res: Response) => {
    try {
        await contentService.deleteExample(req.params.id as string);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting example:', error);
        res.status(500).json({ error: 'Failed to delete example' });
    }
}

// --- EXERCISES ---
export const getExerciseCategories = async (req: Request, res: Response) => {
    try {
        const categories = await contentService.getExerciseCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch exercise categories' });
    }
}

export const getExerciseTypes = async (req: Request, res: Response) => {
    const types = await contentService.getExerciseTypes();
    res.json(types);
}

export const getExercises = async (req: Request, res: Response) => {
    try {
        const exercises = await contentService.getExercises({
            model_type_name: req.query.model_type_name as string,
            exercise_type_name: req.query.exercise_type_name as string,
            type: req.query.type as string,
            search: req.query.search as string
        });
        res.json(exercises);
    } catch (error) {
        console.error('Error fetching exercises:', error);
        res.status(500).json({ error: 'Failed to fetch exercises' });
    }
}

export const createExercise = async (req: Request, res: Response) => {
    try {
        const exercise = await contentService.createExercise(req.body);
        res.status(201).json(exercise);
    } catch (error) {
        console.error('Error creating exercise:', error);
        res.status(500).json({ error: 'Failed to create exercise' });
    }
}

export const updateExercise = async (req: Request, res: Response) => {
    try {
        const exercise = await contentService.updateExercise(req.params.id as string, req.body);
        res.json(exercise);
    } catch (error) {
        console.error('Error updating exercise:', error);
        res.status(500).json({ error: 'Failed to update exercise' });
    }
}

export const updateExerciseStatus = async (req: Request, res: Response) => {
    try {
        const exercise = await contentService.updateExerciseStatus(req.params.id as string, req.body.status as Status);
        res.json(exercise);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update exercise status' });
    }
}

export const deleteExercise = async (req: Request, res: Response) => {
    try {
        await contentService.deleteExercise(req.params.id as string);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting exercise:', error);
        res.status(500).json({ error: 'Failed to delete exercise' });
    }
}
