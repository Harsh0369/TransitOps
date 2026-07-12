import cron from 'node-cron';
import nodemailer from 'nodemailer';
import { prisma } from '../lib/prisma';
import { AuditService } from './audit.service';
import { env } from '../config/env';

export class NotificationService {
  static async getTransporter() {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      return nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: Number(env.SMTP_PORT) || 587,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS
        }
      });
    }

    console.log('No SMTP config found. Generating temporary Ethereal test account...');
    const testAccount = await nodemailer.createTestAccount();
    console.log(`Test account created. You can view sent emails at https://ethereal.email`);
    
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  static initialize() {
    // Run every day at 8:00 AM
    cron.schedule('0 8 * * *', async () => {
      console.log('Running daily compliance check...');
      await this.checkExpiringCompliances();
    });
    console.log('Notification Service initialized.');
  }

  static async checkExpiringCompliances() {
    try {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const expiringCompliances = await prisma.vehicleCompliance.findMany({
        where: {
          expiryDate: {
            lte: thirtyDaysFromNow,
            gt: new Date() // Not already expired
          }
        },
        include: {
          vehicle: true
        }
      });

      if (expiringCompliances.length > 0) {
        let emailText = 'The following compliances are expiring soon:\\n\\n';
        
        for (const comp of expiringCompliances) {
          const daysLeft = Math.ceil((comp.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          emailText += `- Vehicle ${comp.vehicle.registrationNumber} (${comp.vehicle.name}): ${comp.type} expires in ${daysLeft} days.\\n`;
          
          AuditService.log(
            'COMPLIANCE_EXPIRING_WARNING',
            'VehicleCompliance',
            comp.id,
            'SYSTEM',
            { daysLeft }
          );
        }

        console.log('\\n[EMAIL PREPARATION]');
        console.log('Subject: Expiring Vehicle Compliances');
        console.log(emailText);

        const transporter = await this.getTransporter();
        const info = await transporter.sendMail({
          from: '"TransitOps System" <system@transitops.local>',
          to: 'fleetmanagers@transitops.local',
          subject: 'Action Required: Expiring Vehicle Compliances',
          text: emailText
        });
        
        console.log(`Email successfully sent. Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      } else {
        console.log('No expiring compliances found today.');
      }
    } catch (error) {
      console.error('Error during compliance check:', error);
    }
  }
}
