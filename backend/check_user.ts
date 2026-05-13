
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hospital_management';

async function checkUser() {
  await mongoose.connect(MONGODB_URI);
  const user = await User.findOne({ email: 'john@gmail.com' });
  if (user) {
    console.log(`User: ${user.email}, Role: ${user.role}`);
  } else {
    console.log('User not found');
  }
  process.exit(0);
}
checkUser();
