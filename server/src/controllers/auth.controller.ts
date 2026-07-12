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
}
