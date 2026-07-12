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

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const user = await userService.updateUserStatus(req.params.id as string, status, req.user!.userId);
      res.status(200).json(successResponse('User status updated successfully', user));
    } catch (error: any) {
      if (error.message === 'User not found') {
        res.status(404).json(errorResponse(error.message));
        return;
      }
      next(error);
    }
  }

  static async searchUnlinked(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (req.query.q as string) || '';
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await userService.searchUnlinkedUsers(query, page, limit);
      res.status(200).json({
        success: true,
        message: 'Unlinked users retrieved',
        data: result.data,
        meta: result.meta
      });
    } catch (error) {
      next(error);
    }
  }
}
