import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/response.util';

const authService = new AuthService();

export class AuthController {

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, phoneNumber, password } = req.body;
      const user = await authService.registerUser(name, email, password, phoneNumber);

      res.status(201).json(successResponse('User registered successfully', user));
    } catch (error: any) {
      if (error.message === 'Email already in use') {
        res.status(400).json(errorResponse(error.message));
        return;
      }
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const data = await authService.loginUser(email, password);

      res.status(200).json(successResponse('Logged in successfully', data));
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        res.status(401).json(errorResponse(error.message));
        return;
      }
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json(errorResponse('Unauthenticated'));
      }
      
      const data = await authService.getMe(userId);
      res.status(200).json(successResponse('Authenticated user fetched successfully', data));
    } catch (error: any) {
      if (error.message === 'User not found') {
        res.status(404).json(errorResponse(error.message));
        return;
      }
      if (error.message === 'Account suspended' || error.message === 'Account is INACTIVE') {
        res.status(403).json(errorResponse(error.message));
        return;
      }
      next(error);
    }
  }
}
