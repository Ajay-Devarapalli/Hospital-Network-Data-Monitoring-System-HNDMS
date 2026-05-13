
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Appointment } from './src/models/Appointment';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hospital_management';

async function check() {
  await mongoose.connect(MONGODB_URI);
  const count = await Appointment.countDocuments();
  const todayCount = await Appointment.countDocuments({
    date: new Date(new Date().toISOString().split('T')[0] + 'T00:00:00.000Z')
  });
  console.log(`Total: ${count}, Today: ${todayCount}`);
  
  const all = await Appointment.find().limit(5).lean();
  console.log('Sample dates:', all.map(a => a.date.toISOString()));
  
  process.exit(0);
}
check();
