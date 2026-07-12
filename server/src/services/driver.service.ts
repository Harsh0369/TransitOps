import { prisma } from '../lib/prisma';
import { DriverStatus } from '@prisma/client';

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
    
    return prisma.driver.create({ data: driverData });
  }

  async updateDriver(id: string, data: any) {
    return prisma.driver.update({
      where: { id },
      data
    });
  }

  async updateStatus(id: string, status: DriverStatus) {
    return prisma.driver.update({
      where: { id },
      data: { status }
    });
  }
}
