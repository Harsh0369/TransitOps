import { Router } from 'express';
import { DriverController } from '../controllers/driver.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { 
  createDriverSchema, 
  updateDriverSchema, 
  updateDriverStatusSchema,
  updateSafetyScoreSchema,
  renewLicenseSchema
} from '../validators/driver.validator';

const router = Router();

// Protect all driver routes
router.use(authenticate);

// Fleet Managers create basic info, or Drivers self-onboard
router.post('/', authorize(['FLEET_MANAGER', 'ADMIN', 'DRIVER']), validate(createDriverSchema), DriverController.create);
router.patch('/:id', authorize(['FLEET_MANAGER', 'ADMIN']), validate(updateDriverSchema), DriverController.update);

// Safety Officers (and Admins) manage suspension / status and compliance
router.patch('/:id/status', authorize(['SAFETY_OFFICER', 'ADMIN']), validate(updateDriverStatusSchema), DriverController.updateStatus);
router.patch('/:id/score', authorize(['SAFETY_OFFICER', 'ADMIN']), validate(updateSafetyScoreSchema), DriverController.updateSafetyScore);
router.patch('/:id/renew', authorize(['SAFETY_OFFICER', 'ADMIN']), validate(renewLicenseSchema), DriverController.renewLicense);

// View access (Fleet Managers, Safety Officers, Admins)
router.get('/', authorize(['FLEET_MANAGER', 'SAFETY_OFFICER', 'ADMIN']), DriverController.getAll);
router.get('/:id', authorize(['FLEET_MANAGER', 'SAFETY_OFFICER', 'ADMIN']), DriverController.getById);

export default router;
