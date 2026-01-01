import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

import authRoutes from './routes/auth.js';
import companiesRoutes from './routes/companies.js';
import topicsRoutes from './routes/topics.js';
import filesRoutes from './routes/files.js';
import assessmentRoutes from './routes/assessments.js';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
if (!fs.existsSync('uploads/resumes')) {
  fs.mkdirSync('uploads/resumes', { recursive: true });
}

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    const adminEmail = 'pranav21@gmail.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const admin = new User({
        name: 'Admin',
        email: adminEmail,
        password: 'FYP10',
        role: 'admin'
      });
      await admin.save();
      console.log('Admin user created successfully');
    }
  })
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/topics', topicsRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/assessments', assessmentRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Adaptive Learning Platform API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
