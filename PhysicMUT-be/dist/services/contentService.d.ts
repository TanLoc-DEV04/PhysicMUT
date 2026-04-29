type Status = 'ACTIVE' | 'INACTIVE';
export declare const getModel3DTypes: () => Promise<string[]>;
export declare const getModels3D: (filters: {
    model_type_name?: string;
    search?: string;
}) => Promise<({
    theories: {
        id: string;
        created_at: Date;
        updated_at: Date;
        type: string;
        title: string;
        status: string;
        model_type_name: string;
        content_html: string;
        theory_type_name: string | null;
    }[];
    examples: {
        id: string;
        created_at: Date;
        updated_at: Date;
        type: string;
        title: string;
        status: string;
        model_type_name: string;
        example_type_name: string | null;
        problem: string;
        solution: string;
        reference: string | null;
    }[];
    exercises: {
        id: string;
        created_at: Date;
        updated_at: Date;
        type: string;
        status: string;
        model_type_name: string;
        solution: string | null;
        reference: string | null;
        exercise_type_name: string | null;
        question: string;
        options: import("@prisma/client/runtime/library").JsonValue | null;
        correct_answer: string | null;
        level: string;
    }[];
} & {
    name: string;
    created_at: Date;
    updated_at: Date;
    description: string | null;
    status: string;
    model_type_name: string;
    source_url: string;
    thumbnail_url: string | null;
})[]>;
export declare const getModel3DByTypeName: (typeName: string) => Promise<({
    theories: {
        id: string;
        created_at: Date;
        updated_at: Date;
        type: string;
        title: string;
        status: string;
        model_type_name: string;
        content_html: string;
        theory_type_name: string | null;
    }[];
    examples: {
        id: string;
        created_at: Date;
        updated_at: Date;
        type: string;
        title: string;
        status: string;
        model_type_name: string;
        example_type_name: string | null;
        problem: string;
        solution: string;
        reference: string | null;
    }[];
    exercises: {
        id: string;
        created_at: Date;
        updated_at: Date;
        type: string;
        status: string;
        model_type_name: string;
        solution: string | null;
        reference: string | null;
        exercise_type_name: string | null;
        question: string;
        options: import("@prisma/client/runtime/library").JsonValue | null;
        correct_answer: string | null;
        level: string;
    }[];
} & {
    name: string;
    created_at: Date;
    updated_at: Date;
    description: string | null;
    status: string;
    model_type_name: string;
    source_url: string;
    thumbnail_url: string | null;
}) | null>;
export declare const createModel3D: (data: any, files?: any) => Promise<{
    name: string;
    created_at: Date;
    updated_at: Date;
    description: string | null;
    status: string;
    model_type_name: string;
    source_url: string;
    thumbnail_url: string | null;
}>;
export declare const updateModel3D: (typeName: string, data: any, files?: any) => Promise<{
    name: string;
    created_at: Date;
    updated_at: Date;
    description: string | null;
    status: string;
    model_type_name: string;
    source_url: string;
    thumbnail_url: string | null;
}>;
export declare const updateModel3DStatus: (typeName: string, status: Status) => Promise<{
    name: string;
    created_at: Date;
    updated_at: Date;
    description: string | null;
    status: string;
    model_type_name: string;
    source_url: string;
    thumbnail_url: string | null;
}>;
export declare const deleteModel3D: (typeName: string) => Promise<{
    name: string;
    created_at: Date;
    updated_at: Date;
    description: string | null;
    status: string;
    model_type_name: string;
    source_url: string;
    thumbnail_url: string | null;
}>;
export declare const getTheoryCategories: () => Promise<string[]>;
export declare const getTheories: (filters: {
    model_type_name?: string;
    theory_type_name?: string;
    search?: string;
}) => Promise<({
    model3d: {
        name: string;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        status: string;
        model_type_name: string;
        source_url: string;
        thumbnail_url: string | null;
    };
} & {
    id: string;
    created_at: Date;
    updated_at: Date;
    type: string;
    title: string;
    status: string;
    model_type_name: string;
    content_html: string;
    theory_type_name: string | null;
})[]>;
export declare const createTheory: (data: any) => Promise<{
    id: string;
    created_at: Date;
    updated_at: Date;
    type: string;
    title: string;
    status: string;
    model_type_name: string;
    content_html: string;
    theory_type_name: string | null;
}>;
export declare const updateTheory: (id: string, data: any) => Promise<{
    id: string;
    created_at: Date;
    updated_at: Date;
    type: string;
    title: string;
    status: string;
    model_type_name: string;
    content_html: string;
    theory_type_name: string | null;
}>;
export declare const updateTheoryStatus: (id: string, status: Status) => Promise<{
    id: string;
    created_at: Date;
    updated_at: Date;
    type: string;
    title: string;
    status: string;
    model_type_name: string;
    content_html: string;
    theory_type_name: string | null;
}>;
export declare const deleteTheory: (id: string) => Promise<{
    id: string;
    created_at: Date;
    updated_at: Date;
    type: string;
    title: string;
    status: string;
    model_type_name: string;
    content_html: string;
    theory_type_name: string | null;
}>;
export declare const getExampleCategories: () => Promise<string[]>;
export declare const getExamples: (filters: {
    model_type_name?: string;
    example_type_name?: string;
    search?: string;
}) => Promise<({
    model3d: {
        name: string;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        status: string;
        model_type_name: string;
        source_url: string;
        thumbnail_url: string | null;
    };
} & {
    id: string;
    created_at: Date;
    updated_at: Date;
    type: string;
    title: string;
    status: string;
    model_type_name: string;
    example_type_name: string | null;
    problem: string;
    solution: string;
    reference: string | null;
})[]>;
export declare const createExample: (data: any) => Promise<{
    id: string;
    created_at: Date;
    updated_at: Date;
    type: string;
    title: string;
    status: string;
    model_type_name: string;
    example_type_name: string | null;
    problem: string;
    solution: string;
    reference: string | null;
}>;
export declare const updateExample: (id: string, data: any) => Promise<{
    id: string;
    created_at: Date;
    updated_at: Date;
    type: string;
    title: string;
    status: string;
    model_type_name: string;
    example_type_name: string | null;
    problem: string;
    solution: string;
    reference: string | null;
}>;
export declare const updateExampleStatus: (id: string, status: Status) => Promise<{
    id: string;
    created_at: Date;
    updated_at: Date;
    type: string;
    title: string;
    status: string;
    model_type_name: string;
    example_type_name: string | null;
    problem: string;
    solution: string;
    reference: string | null;
}>;
export declare const deleteExample: (id: string) => Promise<{
    id: string;
    created_at: Date;
    updated_at: Date;
    type: string;
    title: string;
    status: string;
    model_type_name: string;
    example_type_name: string | null;
    problem: string;
    solution: string;
    reference: string | null;
}>;
export declare const getExerciseCategories: () => Promise<string[]>;
export declare const getExerciseTypes: () => Promise<string[]>;
export declare const getExercises: (filters: {
    model_type_name?: string;
    exercise_type_name?: string;
    type?: string;
    search?: string;
}) => Promise<({
    model3d: {
        name: string;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        status: string;
        model_type_name: string;
        source_url: string;
        thumbnail_url: string | null;
    };
} & {
    id: string;
    created_at: Date;
    updated_at: Date;
    type: string;
    status: string;
    model_type_name: string;
    solution: string | null;
    reference: string | null;
    exercise_type_name: string | null;
    question: string;
    options: import("@prisma/client/runtime/library").JsonValue | null;
    correct_answer: string | null;
    level: string;
})[]>;
export declare const createExercise: (data: any) => Promise<{
    id: string;
    created_at: Date;
    updated_at: Date;
    type: string;
    status: string;
    model_type_name: string;
    solution: string | null;
    reference: string | null;
    exercise_type_name: string | null;
    question: string;
    options: import("@prisma/client/runtime/library").JsonValue | null;
    correct_answer: string | null;
    level: string;
}>;
export declare const updateExercise: (id: string, data: any) => Promise<{
    id: string;
    created_at: Date;
    updated_at: Date;
    type: string;
    status: string;
    model_type_name: string;
    solution: string | null;
    reference: string | null;
    exercise_type_name: string | null;
    question: string;
    options: import("@prisma/client/runtime/library").JsonValue | null;
    correct_answer: string | null;
    level: string;
}>;
export declare const updateExerciseStatus: (id: string, status: Status) => Promise<{
    id: string;
    created_at: Date;
    updated_at: Date;
    type: string;
    status: string;
    model_type_name: string;
    solution: string | null;
    reference: string | null;
    exercise_type_name: string | null;
    question: string;
    options: import("@prisma/client/runtime/library").JsonValue | null;
    correct_answer: string | null;
    level: string;
}>;
export declare const deleteExercise: (id: string) => Promise<{
    id: string;
    created_at: Date;
    updated_at: Date;
    type: string;
    status: string;
    model_type_name: string;
    solution: string | null;
    reference: string | null;
    exercise_type_name: string | null;
    question: string;
    options: import("@prisma/client/runtime/library").JsonValue | null;
    correct_answer: string | null;
    level: string;
}>;
export {};
//# sourceMappingURL=contentService.d.ts.map