import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import * as MetricsController from './controller';

export const metricsRouter = Router();

// Only admins can access system metrics
metricsRouter.get(
  '/',
  authenticate,
  authorize('settings', 'read'),
  MetricsController.getSystemMetrics
);
