import { Request, Response, NextFunction } from 'express';
import { User, UserRole } from '../../models/User';
import { successResponse } from '../../types/api';
import { ValidationError, NotFoundError, ForbiddenError } from '../../middleware/errorHandler';

const VALID_ROLES: UserRole[] = ['admin', 'doctor', 'nurse', 'receptionist', 'patient'];

/**
 * GET /api/v1/users
 * List all users (paginated). Admin only.
 */
export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const search = (req.query.search as string)?.trim();
    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName:  { $regex: search, $options: 'i' } },
        { email:     { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).select('-password -failedLoginAttempts -lockedUntil').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    res.json(successResponse(users, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }));
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/v1/users/update-role/:id
 * Update a user's role. Admin only.
 * Prevents admin from changing their own role.
 */
export async function updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { role } = req.body as { role?: string };

    // 1. Validate role value
    if (!role || !VALID_ROLES.includes(role as UserRole)) {
      return next(
        new ValidationError(
          `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`
        )
      );
    }

    // 2. Prevent admin from changing their own role
    if (req.user?._id === id) {
      return next(
        new ForbiddenError('You cannot change your own role.')
      );
    }

    // 3. Ensure target user exists
    const user = await User.findById(id).select('-password');
    if (!user) {
      return next(new NotFoundError('User'));
    }

    // 4. Apply update
    user.role = role as UserRole;
    await user.save();

    res.json(successResponse({
      _id:       user._id,
      firstName: user.firstName,
      lastName:  user.lastName,
      email:     user.email,
      role:      user.role,
      isActive:  user.isActive,
    }));
  } catch (err) {
    next(err);
  }
}
