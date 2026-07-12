// @ts-ignore - PrismaClient will be generated once you run 'npx prisma generate' with Node 22+
import { PrismaClient } from '@prisma/client';

export const db = new PrismaClient();

export const connectDb = async () => {
  try {
    await db.$connect();
    console.log('Database connected successfully via Prisma');
  } catch (error) {
    console.error('Database connection failed', error);
    process.exit(1);
  }
};