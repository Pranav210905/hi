import express from 'express';
import multer from 'multer';
import path from 'path';
import File from '../models/File.js';
import { auth } from '../middleware/auth.js';
import { createFolderStructure, getDifficultyFolderPath, validateDifficulty, getAllFilesFromTopic } from '../utils/folderStructure.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { companyId, topicId, difficulty } = req.body;

    if (companyId && topicId && difficulty) {
      if (!validateDifficulty(difficulty)) {
        return cb(new Error('Invalid difficulty level'));
      }
      const diffPath = getDifficultyFolderPath(companyId, topicId, difficulty);
      cb(null, diffPath);
    } else {
      cb(null, 'uploads/');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { topicId, companyId, difficulty } = req.body;

    if (companyId && topicId && difficulty) {
      if (!validateDifficulty(difficulty)) {
        return res.status(400).json({ error: 'Invalid difficulty level' });
      }

      await createFolderStructure(companyId, topicId);
    }

    const file = new File({
      name: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path,
      topicId,
      companyId,
      difficulty: difficulty || null,
      userId: req.userId
    });

    await file.save();
    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/topic/:topicId', auth, async (req, res) => {
  try {
    const files = await File.find({
      topicId: req.params.topicId,
      userId: req.userId
    }).sort({ createdAt: -1 });

    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/company/:companyId/topic/:topicId/difficulty/:difficulty', auth, async (req, res) => {
  try {
    const { companyId, topicId, difficulty } = req.params;

    if (!validateDifficulty(difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty level' });
    }

    const files = await File.find({
      companyId,
      topicId,
      difficulty,
      userId: req.userId,
      mimetype: 'application/pdf'
    }).sort({ createdAt: -1 });

    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/company/:companyId/topic/:topicId/all-difficulties', auth, async (req, res) => {
  try {
    const { companyId, topicId } = req.params;

    const files = await File.find({
      companyId,
      topicId,
      userId: req.userId,
      mimetype: 'application/pdf'
    }).sort({ difficulty: 1, createdAt: -1 });

    const groupedFiles = {
      easy: [],
      medium: [],
      difficult: []
    };

    files.forEach(file => {
      if (file.difficulty && groupedFiles[file.difficulty]) {
        groupedFiles[file.difficulty].push(file);
      }
    });

    res.json(groupedFiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const file = await File.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
