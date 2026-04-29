import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
export declare const validateRequest: (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=validateRequest.d.ts.map