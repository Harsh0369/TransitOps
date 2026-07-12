import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Only ADMIN and FLEET_MANAGER can view audit logs
router.get('/', authorize(['ADMIN', 'FLEET_MANAGER']), AuditController.getLogs);

export default router;
