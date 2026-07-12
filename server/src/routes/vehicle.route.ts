import { Router } from 'express';
import { VehicleController } from '../controllers/vehicle.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { createVehicleSchema, updateVehicleSchema } from '../validators/vehicle.validator';

const router = Router();

// All vehicle routes require authentication
router.use(authenticate);

// Fleet managers and Admins only for mutations
router.post('/', authorize(['FLEET_MANAGER', 'ADMIN']), validate(createVehicleSchema), VehicleController.create);
router.patch('/:id', authorize(['FLEET_MANAGER', 'ADMIN']), validate(updateVehicleSchema), VehicleController.update);
router.delete('/:id', authorize(['FLEET_MANAGER', 'ADMIN']), VehicleController.retire);

// Everyone can view vehicles
router.get('/', VehicleController.getAll);
router.get('/:id', VehicleController.getById);

export default router;
