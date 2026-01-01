import express from 'express';
import multer from 'multer';
import path from 'path';
import { parseQuestionsFromPDF } from '../utils/pdfParser.js';
import Assessment from '../models/Assessment.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

router.post('/parse-pdf', auth, isAdmin, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const questions = await parseQuestionsFromPDF(req.file.path);

    res.json({
      message: 'PDF parsed successfully',
      questionsCount: questions.length,
      questions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/create-assessment-from-pdf', auth, isAdmin, async (req, res) => {
  try {
    const { title, description, companyId, topicId, duration, totalMarks, passingMarks, questions } = req.body;

    const assessment = new Assessment({
      title,
      description,
      companyId,
      topicId,
      duration,
      totalMarks,
      passingMarks,
      questions,
      createdBy: req.userId
    });

    await assessment.save();
    res.status(201).json(assessment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
