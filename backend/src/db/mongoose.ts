import mongoose from 'mongoose';
import { logger } from '../middleware/requestLogger';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export async function connectDB(uri?: string): Promise<void> {
  const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/hms';

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      logger.info('MongoDB connected');
      return;
    } catch (err: any) {
      if (attempt === MAX_RETRIES) {
        logger.error(`FATAL: MongoDB connection failed after ${MAX_RETRIES} attempts.`);
        logger.error(`Error: ${err.message}`);
        
        if (err.message.includes('ReplicaSetNoPrimary') || err.message.includes('ETIMEDOUT')) {
          logger.info('💡 Tip: Check if your IP is whitelisted in Atlas and your internet allows port 27017.');
        }
        throw err;
      }
      logger.warn(`MongoDB connection attempt ${attempt} failed — retrying in ${RETRY_DELAY_MS}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
