import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import * as UsersController from './controller';

export const usersRouter = Router();

// All routes require authentication + admin-only authorization on 'users' resource
usersRouter.use(authenticate);

/**
 * GET /api/v1/users
 * List all users (admin only)
 */
usersRouter.get('/', authorize('users', 'read'), UsersController.listUsers);

/**
 * PUT /api/v1/users/update-role/:id
 * Update a user's role (admin only)
 */
usersRouter.put('/update-role/:id', authorize('users', 'write'), UsersController.updateRole);
