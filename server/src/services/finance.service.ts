import { prisma } from '../lib/prisma';
import { AuditService } from './audit.service';

export class ExpenseService {
  async getAll() {
    return prisma.expense.findMany({ include: { vehicle: true }, orderBy: { date: 'desc' } });
  }

  async createExpense(data: any, userId: string) {
    const expense = await prisma.expense.create({ data });
    AuditService.log('EXPENSE_CREATED', 'Expense', expense.id, userId, { amount: expense.amount, type: expense.expenseType });
    return expense;
  }
}

export class FuelService {
  async getAll() {
    return prisma.fuelLog.findMany({ include: { vehicle: true, trip: true }, orderBy: { date: 'desc' } });
  }
}
