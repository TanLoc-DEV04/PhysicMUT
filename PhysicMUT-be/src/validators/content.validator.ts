import { z } from 'zod';

export const typeNameParamSchema = z.object({
  params: z.object({
    typeName: z.string().min(1),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const toggleStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'INACTIVE']),
  }),
});

export const createModelSchema = z.object({
  body: z.object({
    model_type_name: z.string().min(1),
    name: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    source_url: z.string().optional(),
  }),
});

export const createTheorySchema = z.object({
  body: z.object({
    model_type_name: z.string().optional(),
    title: z.string().min(1),
    content_html: z.string().min(1),
    theory_type_name: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
});

export const createExampleSchema = z.object({
  body: z.object({
    model_type_name: z.string().optional(),
    example_type_name: z.string().optional(),
    title: z.string().min(1),
    problem: z.string().min(1),
    solution: z.string().min(1),
    reference: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
});

export const createExerciseSchema = z.object({
  body: z.object({
    model_type_name: z.string().optional(),
    exercise_type_name: z.string().optional(),
    question: z.string().min(1),
    options: z.any().optional(),
    correct_answer: z.any().optional(),
    level: z.string().optional(),
    type: z.string().optional(),
    reference: z.string().optional(),
    solution: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
});
