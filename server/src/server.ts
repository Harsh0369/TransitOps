import app from './app';
import { prisma } from './lib/prisma';
import { env } from './config/env';
import { NotificationService } from './services/notification.service';
import { connectDb } from './config/db';

const port = env.PORT || 8000;

connectDb().then(() => {
  NotificationService.initialize();
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
});