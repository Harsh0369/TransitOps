import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { updateRoleSchema } from '../validators/user.validator';

const router = Router();

// Protect all user routes
router.use(authenticate);
router.use(authorize(['FLEET_MANAGER'])); // Only Fleet Managers can manage users

router.get('/', UserController.getAll);
router.patch('/:id/role', validate(updateRoleSchema), UserController.updateRole);

export default router;
