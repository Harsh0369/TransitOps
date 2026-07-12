import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Only managers and analysts should see global KPIs
router.get('/kpis', authorize(['FLEET_MANAGER', 'ADMIN', 'FINANCIAL_ANALYST']), DashboardController.getKpis);

export default router;
