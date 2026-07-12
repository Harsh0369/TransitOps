import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { successResponse, errorResponse } from '../utils/response.util';

const userService = new UserService();

export class UserController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json(successResponse('Users retrieved successfully', users));
    } catch (error) {
      next(error);
    }
  }

  static async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { role } = req.body;
      const user = await userService.updateUserRole(req.params.id as string, role);
      res.status(200).json(successResponse('User role updated successfully', user));
    } catch (error: any) {
      if (error.message === 'User not found') {
        res.status(404).json(errorResponse(error.message));
        return;
      }
      next(error);
    }
  }
}
