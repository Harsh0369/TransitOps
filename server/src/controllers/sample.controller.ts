import { Request, Response } from 'express';
import { getSampleData } from '../services/sample.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';

export const getSample = asyncHandler(async (req: Request, res: Response) => {
  // Controller should not have business logic
  const data = await getSampleData();
  res.status(200).json(new ApiResponse(200, data, 'Success'));
});