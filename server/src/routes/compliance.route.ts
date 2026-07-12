import { Router } from 'express';
import { ComplianceController } from '../controllers/compliance.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { createComplianceSchema, renewComplianceSchema } from '../validators/compliance.validator';

const router = Router();

router.use(authenticate);

// READ: Driver, Fleet Manager, Safety Officer, Admin
router.get('/vehicle/:vehicleId', authorize(['DRIVER', 'FLEET_MANAGER', 'SAFETY_OFFICER', 'ADMIN']), ComplianceController.getCompliance);

// WRITE/RENEW: Fleet Manager, Safety Officer, Admin
router.post('/vehicle/:vehicleId', authorize(['FLEET_MANAGER', 'SAFETY_OFFICER', 'ADMIN']), validate(createComplianceSchema), ComplianceController.create);
router.put('/:id', authorize(['FLEET_MANAGER', 'SAFETY_OFFICER', 'ADMIN']), validate(renewComplianceSchema), ComplianceController.renew);

// DELETE: Fleet Manager, Admin
router.delete('/:id', authorize(['FLEET_MANAGER', 'ADMIN']), ComplianceController.remove);

export default router;
