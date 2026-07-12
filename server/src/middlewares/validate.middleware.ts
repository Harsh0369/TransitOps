import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { errorResponse } from '../utils/response.util';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors into a readable structure
        const formattedErrors = error.issues.map((e: any) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        
        res.status(400).json(errorResponse('Validation failed', formattedErrors));
        return;
      }
      
      next(error);
    }
  };
};
