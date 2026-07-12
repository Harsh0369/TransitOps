import { prisma } from '../lib/prisma';
import { Role, UserStatus } from '@prisma/client';
import { AuditService } from './audit.service';

export class UserService {
  async getAllUsers() {
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    return users;
  }

  async updateUserRole(id: string, role: Role) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('User not found');

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true, status: true }
    });

    AuditService.log('USER_ROLE_UPDATED', 'User', id, undefined, { role }, { role: user.role });
    return updatedUser;
  }

  async updateUserStatus(id: string, status: UserStatus, changedBy: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('User not found');

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, name: true, email: true, role: true, status: true }
    });

    AuditService.log('USER_STATUS_UPDATED', 'User', id, changedBy, { status }, { status: user.status });
    return updatedUser;
  }

  async searchUnlinkedUsers(query: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    // Support partial match for name, email, phone. Case-insensitive.
    // Exclude users who already have a driver profile.
    // Ensure they are not deleted.
    const where = {
      deletedAt: null,
      drivers: { none: {} },
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { email: { contains: query, mode: 'insensitive' as const } },
        { phoneNumber: { contains: query, mode: 'insensitive' as const } }
      ]
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: { id: true, name: true, email: true, phoneNumber: true, role: true }
      }),
      prisma.user.count({ where })
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
