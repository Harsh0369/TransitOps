import { Router } from 'express';
import { TripController } from '../controllers/trip.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { createTripSchema, completeTripSchema } from '../validators/trip.validator';

const router = Router();

// Protect all trip routes
router.use(authenticate);

// 1. DRAFT creation (Fleet Manager)
router.post('/', authorize(['FLEET_MANAGER', 'ADMIN']), validate(createTripSchema), TripController.create);

// 2. DISPATCH action (Fleet Manager)
router.patch('/:id/dispatch', authorize(['FLEET_MANAGER', 'ADMIN']), TripController.dispatch);

// 3. COMPLETE by Driver (Moves to PENDING_APPROVAL)
router.patch('/:id/complete', authorize(['DRIVER', 'FLEET_MANAGER', 'ADMIN']), validate(completeTripSchema), TripController.reportComplete);

// 4. APPROVE completion (Fleet Manager) - Finalizes trip, updates vehicle odometer, creates FuelLog
router.patch('/:id/approve', authorize(['FLEET_MANAGER', 'ADMIN']), TripController.approve);

// Cancel Trip (Fleet Manager)
router.patch('/:id/cancel', authorize(['FLEET_MANAGER', 'ADMIN']), TripController.cancel);

// View Trips
router.get('/', authorize(['FLEET_MANAGER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST', 'ADMIN']), TripController.getAll);
router.get('/my-trips', authorize(['DRIVER']), TripController.getMyTrips);

export default router;
