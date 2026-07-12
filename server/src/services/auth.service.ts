import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { Role } from '@prisma/client';
import { AuditService } from './audit.service';

export class AuthService {
  private readonly jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
  }

  async registerUser(name: string, email: string, passwordRaw: string, phoneNumber?: string) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(passwordRaw, 10);

    const userCount = await prisma.user.count();
    const assignedRole = userCount === 0 ? 'FLEET_MANAGER' : 'DRIVER';

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phoneNumber,
        password: hashedPassword,
        role: assignedRole,
      },
    });

    await AuditService.log('USER_REGISTERED', 'User', newUser.id, newUser.id, { role: assignedRole });

    // Exclude password from the returned object
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async loginUser(email: string, passwordRaw: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new Error(`Account is ${user.status}. Please contact the Fleet Manager.`);
    }

    if (user.deletedAt) {
      throw new Error('Account has been deleted');
    }

    const isPasswordValid = await bcrypt.compare(passwordRaw, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      this.jwtSecret,
      { expiresIn: '1d' }
    );

    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }
}