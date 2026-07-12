import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import authRoute from './routes/auth.route';
import userRoute from './routes/user.route';
import vehicleRoute from './routes/vehicle.route';
import driverRoute from './routes/driver.route';
import tripRoute from './routes/trip.route';
import userRoute from './routes/user.route';
import maintenanceRoute from './routes/maintenance.route';
import financeRoute from './routes/finance.route';
import complianceRoute from './routes/compliance.route';
import dashboardRoute from './routes/dashboard.route';
import sampleRoute from './routes/sample.route';
import auditRoute from './routes/audit.route';
import uploadRoute from './routes/upload.route';
import { globalErrorMiddleware, notFoundMiddleware } from './middlewares/error.middleware';
import path from 'path';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/vehicles', vehicleRoute);
app.use('/api/drivers', driverRoute);
app.use('/api/trips', tripRoute);
app.use('/api/users', userRoute);
app.use('/api/maintenance', maintenanceRoute);
app.use('/api/finance', financeRoute);
app.use('/api/compliance', complianceRoute);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/audit', auditRoute);
app.use('/api/upload', uploadRoute);
app.use('/api/sample', sampleRoute);

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

app.use(notFoundMiddleware);
app.use(globalErrorMiddleware);

export default app;