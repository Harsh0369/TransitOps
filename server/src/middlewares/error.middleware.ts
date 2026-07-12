import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export const notFoundMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
};

export const globalErrorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const isValidation = !!(err as any).reasons;
  const statusCode = isValidation ? 400 : (res.statusCode === 200 ? 500 : res.statusCode);
  
  const response: any = {
    message: err.message,
    stack: env.NODE_ENV === 'production' ? null : err.stack,
  };

  if (isValidation) {
    response.reasons = (err as any).reasons;
  }

  res.status(statusCode).json(response);
};