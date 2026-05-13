console.log('SCRIPT_INIT');
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../models/User';
import { Patient } from '../models/Patient';
import { Doctor } from '../models/Doctor';
import { Nurse } from '../models/Nurse';
import { Receptionist } from '../models/Receptionist';
import { Department } from '../models/Department';
import { Appointment } from '../models/Appointment';
import { InventoryItem } from '../models/InventoryItem';
import { LabOrder } from '../models/LabOrder';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hospital_management';

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🧹 Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Patient.deleteMany({}),
      Doctor.deleteMany({}),
      Nurse.deleteMany({}),
      Receptionist.deleteMany({}),
      Department.deleteMany({}),
      Appointment.deleteMany({}),
      InventoryItem.deleteMany({}),
      LabOrder.deleteMany({}),
    ]);

    // 1. Departments
    console.log('🏢 Creating departments...');
    const depts = await Department.insertMany([
      { name: 'Cardiology', description: 'Heart and vascular system care', bedCount: 20, location: 'Wing A, Floor 2' },
      { name: 'Neurology', description: 'Brain and nervous system care', bedCount: 15, location: 'Wing B, Floor 3' },
      { name: 'Pediatrics', description: 'Children health care', bedCount: 25, location: 'Wing C, Floor 1' },
      { name: 'Emergency', description: '24/7 Emergency services', bedCount: 10, location: 'Ground Floor' },
    ]);

    // 2. Admin User
    console.log('👤 Creating admin...');
    const adminUser = await User.create({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@hospital.com',
      password: 'Admin@123',
      role: 'admin',
      isActive: true,
    });

    // 3. Doctors
    console.log('👨‍⚕️ Creating doctors...');
    const docData = [
      { firstName: 'Alice', lastName: 'Smith', email: 'alice@hospital.com', password: 'Doctor@123', role: 'doctor', isActive: true },
      { firstName: 'Bob', lastName: 'Wilson', email: 'bob@hospital.com', password: 'Doctor@123', role: 'doctor', isActive: true },
    ];
    const doctorProfiles = [];
    for (let i = 0; i < docData.length; i++) {
      const user = await User.create(docData[i]);
      const doc = await Doctor.create({
        userId: user._id,
        specialization: i === 0 ? 'Cardiology' : 'Neurology',
        department: depts[i]._id,
        availability: [{ day: 'monday', startTime: '09:00', endTime: '17:00' }],
        consultationFee: 500,
        qualification: ['MBBS', i === 0 ? 'MD Cardiology' : 'MD Neurology'],
      });
      doctorProfiles.push(doc);
    }

    // 4. Nurses & Receptionists
    console.log('👩‍⚕️ Creating staff...');
    const nurseUser = await User.create({ firstName: 'Carol', lastName: 'White', email: 'carol@hospital.com', password: 'Nurse@123', role: 'nurse', isActive: true });
    await Nurse.create({ userId: nurseUser._id, employeeId: 'NUR001', department: depts[0]._id, shift: 'morning' });

    const recepUser = await User.create({ firstName: 'David', lastName: 'Brown', email: 'david@hospital.com', password: 'Staff@123', role: 'receptionist', isActive: true });
    await Receptionist.create({ userId: recepUser._id, employeeId: 'REC001', department: depts[3]._id });

    // 5. Patients
    console.log('🏥 Creating patients...');
    const patData = [
      { firstName: 'John', lastName: 'Doe', email: 'john@gmail.com', password: 'Patient@123', role: 'patient', isActive: true },
      { firstName: 'Jane', lastName: 'Doe', email: 'jane@gmail.com', password: 'Patient@123', role: 'patient', isActive: true },
    ];
    const patientProfiles = [];
    for (const data of patData) {
      const user = await User.create(data);
      const pat = await Patient.create({
        userId: user._id,
        bloodGroup: 'O+',
        emergencyContact: { name: 'Emergency Contact', relationship: 'Relative', phone: '1234567890' },
      });
      patientProfiles.push(pat);
    }

    // 6. Appointments
    console.log('📅 Creating appointments...');
    await Appointment.create({
      patient: patientProfiles[0]._id,
      doctor: doctorProfiles[0]._id,
      department: depts[0]._id,
      date: new Date(Date.now() + 86400000), // tomorrow
      timeSlot: '10:00',
      type: 'consultation',
      status: 'scheduled',
      reason: 'Regular heart checkup',
      createdBy: adminUser._id,
    });

    // 7. Inventory
    console.log('📦 Creating inventory...');
    const invData = [
      { name: 'Paracetamol', code: 'MED001', category: 'medicine', quantity: 500, unit: 'tablet', reorderLevel: 50, location: 'Pharmacy Shelf A' },
      { name: 'Surgical Masks', code: 'SUP001', category: 'supply', quantity: 1000, unit: 'piece', reorderLevel: 200, location: 'Store Room 1' },
      { name: 'Oxygen Tank', code: 'EQP001', category: 'equipment', quantity: 10, unit: 'unit', reorderLevel: 2, location: 'ER Station' },
    ];
    for (const data of invData) {
      await InventoryItem.create(data);
    }

    // 8. Lab Orders
    console.log('🧪 Creating lab orders...');
    await LabOrder.create({
      patient: patientProfiles[0]._id,
      doctor: doctorProfiles[0]._id,
      tests: [{ name: 'Complete Blood Count', code: 'CBC', status: 'pending' }],
      priority: 'routine',
      status: 'pending',
      notes: 'Standard screening',
    });

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
}

seed();
