import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Only managers and analysts should see global KPIs
router.get('/kpis', authorize(['FLEET_MANAGER', 'ADMIN', 'FINANCIAL_ANALYST']), DashboardController.getKpis);

router.get('/operations-center', authorize(['FLEET_MANAGER', 'ADMIN', 'SAFETY_OFFICER']), DashboardController.getOperationsCenter);
router.get('/insights', authorize(['FLEET_MANAGER', 'ADMIN', 'FINANCIAL_ANALYST']), DashboardController.getExecutiveInsights);
router.get('/search', authorize(['FLEET_MANAGER', 'ADMIN', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST']), DashboardController.search);
router.get('/notifications', authorize(['FLEET_MANAGER', 'ADMIN', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST']), DashboardController.getNotifications);

export default router;
