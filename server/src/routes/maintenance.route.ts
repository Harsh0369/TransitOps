import { Router } from 'express';
import { MaintenanceController } from '../controllers/maintenance.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { createMaintenanceSchema, closeMaintenanceSchema } from '../validators/maintenance.validator';

const router = Router();

router.use(authenticate);

router.get('/', authorize(['FLEET_MANAGER', 'ADMIN', 'FINANCIAL_ANALYST']), MaintenanceController.getAll);
router.post('/', authorize(['FLEET_MANAGER', 'ADMIN']), validate(createMaintenanceSchema), MaintenanceController.start);
router.patch('/:id/close', authorize(['FLEET_MANAGER', 'ADMIN']), validate(closeMaintenanceSchema), MaintenanceController.close);

export default router;
