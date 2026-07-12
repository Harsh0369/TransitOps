import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import authRoute from './routes/auth.route';
import vehicleRoute from './routes/vehicle.route';
import sampleRoute from './routes/sample.route';
import { globalErrorMiddleware, notFoundMiddleware } from './middlewares/error.middleware';

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
app.use('/api/vehicles', vehicleRoute);
app.use('/api/sample', sampleRoute);

// Error Handling
app.use(notFoundMiddleware);
app.use(globalErrorMiddleware);

export default app;