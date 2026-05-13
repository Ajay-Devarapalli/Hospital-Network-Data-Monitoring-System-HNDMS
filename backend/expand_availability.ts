
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Doctor } from './src/models/Doctor';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hospital_management';

async function expandAvailability() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected');

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const availability = days.map(day => ({
    day,
    startTime: '09:00',
    endTime: '17:00'
  }));

  await Doctor.updateMany({}, { $set: { availability } });
  console.log('✅ Updated all doctors to be available Monday-Friday, 09:00 - 17:00');
  
  process.exit(0);
}
expandAvailability();
