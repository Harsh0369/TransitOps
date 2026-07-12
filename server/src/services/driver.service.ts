import { prisma } from '../lib/prisma';
import { DriverStatus } from '@prisma/client';
import { AuditService } from './audit.service';

export class DriverService {
  async getAllDrivers() {
    return prisma.driver.findMany({
      include: { user: { select: { email: true, role: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getDriverById(id: string) {
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: { user: { select: { email: true, role: true } } }
    });
    if (!driver) throw new Error('Driver not found');
    return driver;
  }

  async createDriver(data: any) {
    const existing = await prisma.driver.findUnique({
      where: { licenseNumber: data.licenseNumber }
    });
    
    if (existing) {
      throw new Error('License number already exists');
    }

    let targetUserId = data.userId;

    if (!targetUserId && (data.userEmail || data.userPhoneNumber)) {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            data.userEmail ? { email: data.userEmail } : {},
            data.userPhoneNumber ? { phoneNumber: data.userPhoneNumber } : {}
          ]
        }
      });
      if (user) {
        targetUserId = user.id;
      } else {
        throw new Error('User not found with provided email or phone number');
      }
    }

    const { userEmail, userPhoneNumber, ...driverData } = data;
    if (targetUserId) {
      driverData.userId = targetUserId;
    }
    
    const newDriver = await prisma.driver.create({ data: driverData });
    AuditService.log('DRIVER_CREATED', 'Driver', newDriver.id, undefined, { licenseNumber: newDriver.licenseNumber });
    return newDriver;
  }

  async updateDriver(id: string, data: any) {
    const updated = await prisma.driver.update({ where: { id }, data });
    AuditService.log('DRIVER_UPDATED', 'Driver', id, undefined, { updatedFields: Object.keys(data) });
    return updated;
  }

  async updateStatus(id: string, status: DriverStatus, userId: string) {
    const updated = await prisma.driver.update({ where: { id }, data: { status } });
    AuditService.log('DRIVER_STATUS_CHANGED', 'Driver', id, userId, { status });
    return updated;
  }

  async updateSafetyScore(id: string, safetyScore: number, userId: string) {
    const updated = await prisma.driver.update({ where: { id }, data: { safetyScore } });
    AuditService.log('DRIVER_SAFETY_SCORE_UPDATED', 'Driver', id, userId, { safetyScore });
    return updated;
  }

  async renewLicense(id: string, licenseExpiry: Date, userId: string) {
    const updated = await prisma.driver.update({ where: { id }, data: { licenseExpiry } });
    AuditService.log('DRIVER_LICENSE_RENEWED', 'Driver', id, userId, { licenseExpiry });
    return updated;
  }
}
