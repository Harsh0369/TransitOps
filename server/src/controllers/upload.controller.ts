import { Request, Response, NextFunction } from 'express';
import { successResponse, errorResponse } from '../utils/response.util';

export class UploadController {
  static async uploadFile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json(errorResponse('No file provided'));
      }
      
      // Return the public URL for the uploaded file
      const fileUrl = `/uploads/${req.file.filename}`;
      
      res.status(200).json(successResponse('File uploaded successfully', { url: fileUrl }));
    } catch (error) {
      next(error);
    }
  }
}
