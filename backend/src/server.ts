import http from 'http';
import dotenv from 'dotenv';
import { app } from './app';
import { connectDB, disconnectDB } from './db/mongoose';
import { connectRedis, disconnectRedis } from './db/redis';
import { initSocket } from './socket';
import { env } from './config/env';
import { logger } from './middleware/requestLogger';
import { startAppointmentJobs } from './jobs/appointments';
import { startInventoryJobs } from './jobs/inventory';

// 🔹 Load environment variables from .env
dotenv.config();

async function bootstrap() {
  try {
    // ✅ Connect to MongoDB using .env
    await connectDB();

    // ⚠️ Optional: Redis (keep only if installed)
    try {
      await connectRedis();
    } catch (err) {
      logger.warn('Redis not connected (skipping for local dev)');
    }

    const server = http.createServer(app);

    // ✅ Use JWT from .env instead of AWS secrets
    initSocket(server, process.env.JWT_SECRET as string);

    server.listen(env.PORT, () => {
      logger.info(`HMS API running on port ${env.PORT} [${env.NODE_ENV}]`);

      // Start background jobs
      startAppointmentJobs();
      startInventoryJobs();
    });

    const shutdown = async (signal: string) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(async () => {
        await disconnectDB();

        try {
          await disconnectRedis();
        } catch (err) {
          logger.warn('Redis disconnect skipped');
        }

        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (err) {
    console.error('Fatal startup error:', err);
    process.exit(1);
  }
}

bootstrap();