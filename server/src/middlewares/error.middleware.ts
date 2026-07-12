import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export const notFoundMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
};

export const globalErrorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: env.NODE_ENV === 'production' ? null : err.stack,
  });
};