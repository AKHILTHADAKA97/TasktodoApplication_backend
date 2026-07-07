import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const usersData = [
  {
    name: 'Admin User',
    email: 'admin@taskflow.com',
    password: 'admin123',
    bio: 'System Administrator for TaskFlow Workflow Management.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
  },
  {
    name: 'Dev TaskFlow',
    email: 'developer@taskflow.com',
    password: 'dev12345',
    bio: 'Software Engineer managing agile sprints.',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
  },
  {
    name: 'Alex Student',
    email: 'student@taskflow.com',
    password: 'student123',
    bio: 'Undergraduate student balancing classes and side projects.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
  }
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/taskflow';
    console.log(`Connecting to database at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB database.');

    for (const u of usersData) {
      // Remove if already exists to prevent duplicate key errors
      await User.findOneAndDelete({ email: u.email });
      
      // Hash password manually before creating since select: false and pre-save hooks
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(u.password, salt);

      await User.create({
        name: u.name,
        email: u.email,
        password: hashedPassword,
        bio: u.bio,
        avatar: u.avatar
      });
      console.log(`Seeded user: ${u.email}`);
    }
  } catch (error) {
    console.error('Error seeding database:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
};

const generatePDF = () => {
  const pdfPath = path.join('..', 'TaskFlow_Workflow_and_Credentials.pdf');
  console.log(`Generating PDF at ${pdfPath}...`);

  const doc = new PDFDocument({ margin: 50 });
  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);

  // PDF Heading Styles
  doc.fillColor('#4f46e5').fontSize(26).font('Helvetica-Bold').text('TaskFlow — Todo Management System', { align: 'center' });
  doc.moveDown(0.2);
  doc.fillColor('#64748b').fontSize(12).font('Helvetica-Oblique').text('Workflow Architecture & Testing Credentials Guide', { align: 'center' });
  doc.moveDown(1.5);

  // Section 1: Workflow
  doc.fillColor('#1e293b').fontSize(16).font('Helvetica-Bold').text('1. Project Architecture & Workflow');
  doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, doc.y).lineTo(560, doc.y).stroke();
  doc.moveDown(0.8);

  const workflowText = 
    "• Frontend Layer (Vite + React): Serves the client interface on Port 80 (Docker) or Port 5173 (Dev).\n" +
    "• Backend REST API (Node.js + Express): Listens for payload requests on Port 5000 and routes them to controller services.\n" +
    "• State Sync (Zustand & React Query): Zustand persists light/dark themes and local session login tokens. React Query queries and caches task data in the background.\n" +
    "• Database Layer (MongoDB): Mongoose handles storage schemas for 'users' and 'tasks' collections.\n" +
    "• Auth Authentication Flows:\n" +
    "    - JWT Mode: Client submits email/password, backend hashes, verifies, and replies with standard JWT token.\n" +
    "    - Google Auth: Frontend resolves Google account UID from client SDK, checks client-keys dynamically from backend, and backend admin verifies the identity to issue backend JWT.";

  doc.fillColor('#334155').fontSize(11).font('Helvetica').text(workflowText, { lineGap: 4 });
  doc.moveDown(1.8);

  // Section 2: Credentials
  doc.fillColor('#1e293b').fontSize(16).font('Helvetica-Bold').text('2. Active Testing User Credentials');
  doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, doc.y).lineTo(560, doc.y).stroke();
  doc.moveDown(0.8);

  doc.fillColor('#475569').fontSize(10).font('Helvetica-BoldOblique').text('The database has been seeded. You can log in using these credentials immediately:', { lineGap: 4 });
  doc.moveDown(0.8);

  usersData.forEach((u, index) => {
    doc.fillColor('#4f46e5').fontSize(12).font('Helvetica-Bold').text(`Profile Account #${index + 1}: ${u.name}`);
    doc.fillColor('#334155').fontSize(10).font('Helvetica').text(`  • Email address: `, { indented: 10, continued: true });
    doc.font('Helvetica-Bold').text(u.email);
    doc.font('Helvetica').text(`  • Password: `, { indented: 10, continued: true });
    doc.font('Helvetica-Bold').text(u.password);
    doc.font('Helvetica').text(`  • Bio / Role: `, { indented: 10, continued: true });
    doc.font('Helvetica-Oblique').text(u.bio);
    doc.moveDown(0.8);
  });

  doc.moveDown(1);

  // Footer note
  doc.rect(50, doc.y, 510, 50).fillAndStroke('#f8fafc', '#e2e8f0');
  doc.fillColor('#475569').fontSize(9).font('Helvetica-Oblique').text(
    'Note: For Firebase Google Logins, if API credentials are not added to the backend .env file, the client will show a sandbox pop-up modal allowing you to input any email and simulate standard logins.',
    60,
    doc.y - 42,
    { width: 490 }
  );

  doc.end();
  console.log('PDF generation complete.');
};

const run = async () => {
  await seedDatabase();
  generatePDF();
};

run();
