import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.service';
import { successResponse } from '../utils/response.util';
import { QueryUtil } from '../utils/query.util';
import { CsvUtil } from '../utils/csv.util';

const auditService = new AuditService();

export class AuditController {
  static async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const options = QueryUtil.parse(req, 'timestamp');
      const result = await auditService.getLogs(options);

      if (options.exportData) {
        res.header('Content-Type', 'text/csv');
        res.attachment('audit_logs.csv');
        return res.send(CsvUtil.jsonToCsv(result as any[]));
      }

      const { data, total } = result as { data: any[], total: number };
      res.status(200).json(successResponse('Audit logs retrieved', data, QueryUtil.getPaginationMeta(total, options)));
    } catch (error) {
      next(error);
    }
  }
}
