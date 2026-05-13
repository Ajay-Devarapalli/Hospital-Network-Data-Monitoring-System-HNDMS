
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/models/User';
import { Patient } from './src/models/Patient';
import { Doctor } from './src/models/Doctor';
import { Appointment } from './src/models/Appointment';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hospital_management';

async function fixData() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected');

  const targetDate = new Date('2026-05-06T00:00:00.000Z');
  await Appointment.deleteMany({ date: targetDate });
  console.log('🧹 Cleared existing appointments for today');

  const patients = await Patient.find().limit(3);
  const doctors = await Doctor.find().limit(2);
  const admin = await User.findOne({ role: 'admin' });

  const apptsData = [
    {
      patient: patients[0]._id,
      doctor: doctors[0]._id,
      date: targetDate,
      timeSlot: '09:00',
      type: 'consultation',
      status: 'confirmed',
      reason: 'Regular heart checkup',
      createdBy: admin?._id
    },
    {
      patient: patients[1]._id,
      doctor: doctors[1]._id,
      date: targetDate,
      timeSlot: '11:30',
      type: 'follow-up',
      status: 'scheduled',
      reason: 'Routine brain scan',
      createdBy: admin?._id
    },
    {
      patient: patients[2]?._id || patients[0]._id,
      doctor: doctors[0]._id,
      date: targetDate,
      timeSlot: '14:15',
      type: 'emergency',
      status: 'confirmed',
      reason: 'Sudden chest pain',
      createdBy: admin?._id
    }
  ];

  for (const data of apptsData) {
    const a = new Appointment(data);
    await a.save();
    console.log(`✅ Saved appointment: ${a.appointmentId}`);
  }
  
  process.exit(0);
}
fixData();
