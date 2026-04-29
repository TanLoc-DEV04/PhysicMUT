import { z } from 'zod';
export declare const typeNameParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        typeName: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const idParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const toggleStatusSchema: z.ZodObject<{
    body: z.ZodObject<{
        status: z.ZodEnum<{
            ACTIVE: "ACTIVE";
            INACTIVE: "INACTIVE";
        }>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const createModelSchema: z.ZodObject<{
    body: z.ZodObject<{
        model_type_name: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<{
            ACTIVE: "ACTIVE";
            INACTIVE: "INACTIVE";
        }>>;
        source_url: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const createTheorySchema: z.ZodObject<{
    body: z.ZodObject<{
        model_type_name: z.ZodOptional<z.ZodString>;
        title: z.ZodString;
        content_html: z.ZodString;
        theory_type_name: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<{
            ACTIVE: "ACTIVE";
            INACTIVE: "INACTIVE";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const createExampleSchema: z.ZodObject<{
    body: z.ZodObject<{
        model_type_name: z.ZodOptional<z.ZodString>;
        example_type_name: z.ZodOptional<z.ZodString>;
        title: z.ZodString;
        problem: z.ZodString;
        solution: z.ZodString;
        reference: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<{
            ACTIVE: "ACTIVE";
            INACTIVE: "INACTIVE";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const createExerciseSchema: z.ZodObject<{
    body: z.ZodObject<{
        model_type_name: z.ZodOptional<z.ZodString>;
        exercise_type_name: z.ZodOptional<z.ZodString>;
        question: z.ZodString;
        options: z.ZodOptional<z.ZodAny>;
        correct_answer: z.ZodOptional<z.ZodAny>;
        level: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
        reference: z.ZodOptional<z.ZodString>;
        solution: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<{
            ACTIVE: "ACTIVE";
            INACTIVE: "INACTIVE";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=content.validator.d.ts.map