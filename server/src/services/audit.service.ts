import { prisma } from '../lib/prisma';

export class AuditService {
  /**
   * Logs a business action to the database.
   * This operates independently of any transaction to ensure the log is saved 
   * even if later steps fail, though typically it's fired after success.
   */
  static async log(
    action: string,
    entity: string,
    entityId: string,
    userId?: string,
    metadata?: any,
    oldValue?: any,
    newValue?: any,
    reason?: string,
    ipAddress?: string
  ) {
    try {
      await prisma.auditLog.create({
        data: {
          action,
          entity,
          entityId,
          userId,
          metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
          oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : undefined,
          newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : undefined,
          reason,
          ipAddress
        },
      });
    } catch (error) {
      console.error('Failed to write audit log:', error);
      // We don't throw here to avoid breaking core business logic if auditing fails
    }
  }
}
