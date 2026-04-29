"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExerciseSchema = exports.createExampleSchema = exports.createTheorySchema = exports.createModelSchema = exports.toggleStatusSchema = exports.idParamSchema = exports.typeNameParamSchema = void 0;
const zod_1 = require("zod");
exports.typeNameParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        typeName: zod_1.z.string().min(1),
    }),
});
exports.idParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1),
    }),
});
exports.toggleStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['ACTIVE', 'INACTIVE']),
    }),
});
exports.createModelSchema = zod_1.z.object({
    body: zod_1.z.object({
        model_type_name: zod_1.z.string().min(1),
        name: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        status: zod_1.z.enum(['ACTIVE', 'INACTIVE']).optional(),
        source_url: zod_1.z.string().optional(),
    }),
});
exports.createTheorySchema = zod_1.z.object({
    body: zod_1.z.object({
        model_type_name: zod_1.z.string().optional(),
        title: zod_1.z.string().min(1),
        content_html: zod_1.z.string().min(1),
        theory_type_name: zod_1.z.string().optional(),
        status: zod_1.z.enum(['ACTIVE', 'INACTIVE']).optional(),
    }),
});
exports.createExampleSchema = zod_1.z.object({
    body: zod_1.z.object({
        model_type_name: zod_1.z.string().optional(),
        example_type_name: zod_1.z.string().optional(),
        title: zod_1.z.string().min(1),
        problem: zod_1.z.string().min(1),
        solution: zod_1.z.string().min(1),
        reference: zod_1.z.string().optional(),
        status: zod_1.z.enum(['ACTIVE', 'INACTIVE']).optional(),
    }),
});
exports.createExerciseSchema = zod_1.z.object({
    body: zod_1.z.object({
        model_type_name: zod_1.z.string().optional(),
        exercise_type_name: zod_1.z.string().optional(),
        question: zod_1.z.string().min(1),
        options: zod_1.z.any().optional(),
        correct_answer: zod_1.z.any().optional(),
        level: zod_1.z.string().optional(),
        type: zod_1.z.string().optional(),
        reference: zod_1.z.string().optional(),
        solution: zod_1.z.string().optional(),
        status: zod_1.z.enum(['ACTIVE', 'INACTIVE']).optional(),
    }),
});
//# sourceMappingURL=content.validator.js.map