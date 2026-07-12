import { Request } from 'express';

export interface QueryOptions {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  exportData?: boolean;
}

export class QueryUtil {
  static parse(req: Request, defaultSortBy: string = 'createdAt'): QueryOptions {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const sortBy = (req.query.sortBy as string) || defaultSortBy;
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';
    
    const exportData = req.query.export === 'csv';

    return { page, limit, skip, sortBy, sortOrder, exportData };
  }

  static getPaginationMeta(total: number, options: QueryOptions) {
    return {
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit)
    };
  }
}
