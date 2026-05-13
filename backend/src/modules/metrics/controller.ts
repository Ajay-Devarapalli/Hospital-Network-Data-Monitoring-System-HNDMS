import { Request, Response, NextFunction } from 'express';
import * as si from 'systeminformation';
import { successResponse } from '../../types/api';

/**
 * GET /api/v1/metrics
 * Fetches CPU, Memory, and Uptime metrics.
 */
export async function getSystemMetrics(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [cpu, mem, time] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.time()
    ]);

    const metrics = {
      cpu: Math.round(cpu.currentLoad * 100) / 100,
      memory: Math.round((mem.used / mem.total) * 10000) / 100,
      uptime: time.uptime
    };

    res.json(successResponse(metrics));
  } catch (err) {
    next(err);
  }
}
