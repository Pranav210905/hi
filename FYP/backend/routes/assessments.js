import express from 'express';
import Assessment from '../models/Assessment.js';
import UserAttempt from '../models/UserAttempt.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

router.post('/', auth, isAdmin, async (req, res) => {
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

router.get('/', auth, async (req, res) => {
  try {
    const assessments = await Assessment.find({ isActive: true })
      .populate('companyId', 'name')
      .populate('topicId', 'name')
      .select('-questions.correctAnswer -questions.testCases')
      .sort({ createdAt: -1 });

    res.json(assessments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/all', auth, isAdmin, async (req, res) => {
  try {
    const assessments = await Assessment.find()
      .populate('companyId', 'name')
      .populate('topicId', 'name')
      .sort({ createdAt: -1 });

    res.json(assessments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('companyId', 'name')
      .populate('topicId', 'name');

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (req.user.role !== 'admin') {
      assessment.questions = assessment.questions.map(q => ({
        ...q.toObject(),
        correctAnswer: undefined,
        testCases: undefined
      }));
    }

    res.json(assessment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    res.json(assessment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndDelete(req.params.id);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    res.json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/start', auth, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const attempt = new UserAttempt({
      userId: req.userId,
      assessmentId: assessment._id,
      status: 'in-progress'
    });

    await attempt.save();
    res.json({ attemptId: attempt._id, assessment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { attemptId, answers } = req.body;

    const attempt = await UserAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    let totalScore = 0;
    const marksPerQuestion = assessment.totalMarks / assessment.questions.length;

    const sectionStats = {};

    const evaluatedAnswers = answers.map((answer) => {
      const question = assessment.questions.id(answer.questionId);
      if (!question) return answer;

      const isCorrect = question.correctAnswer === answer.answer;
      const marksObtained = isCorrect ? marksPerQuestion : 0;
      totalScore += marksObtained;

      if (!sectionStats[question.section]) {
        sectionStats[question.section] = { correct: 0, total: 0, totalTime: 0 };
      }
      sectionStats[question.section].total += 1;
      if (isCorrect) sectionStats[question.section].correct += 1;
      sectionStats[question.section].totalTime += answer.timeTaken || 0;

      return {
        ...answer,
        isCorrect,
        marksObtained
      };
    });

    const sectionWise = Object.entries(sectionStats).map(([section, stats]) => ({
      section,
      correct: stats.correct,
      total: stats.total,
      avgTime: stats.totalTime / stats.total
    }));

    const totalTimeTaken = answers.reduce((sum, a) => sum + (a.timeTaken || 0), 0);

    attempt.answers = evaluatedAnswers;
    attempt.totalScore = totalScore;
    attempt.percentage = (totalScore / assessment.totalMarks) * 100;
    attempt.timeTaken = totalTimeTaken;
    attempt.status = 'completed';
    attempt.completedAt = new Date();
    attempt.performance = {
      accuracy: (evaluatedAnswers.filter(a => a.isCorrect).length / evaluatedAnswers.length) * 100,
      speed: totalTimeTaken / evaluatedAnswers.length,
      sectionWise
    };

    await attempt.save();

    res.json({
      message: 'Assessment submitted successfully',
      result: {
        totalScore,
        percentage: attempt.percentage,
        passed: attempt.percentage >= assessment.passingMarks,
        performance: attempt.performance
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/attempts/my-attempts', auth, async (req, res) => {
  try {
    const attempts = await UserAttempt.find({ userId: req.userId })
      .populate('assessmentId', 'title description totalMarks')
      .sort({ startedAt: -1 });

    res.json(attempts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/attempts/:id', auth, async (req, res) => {
  try {
    const attempt = await UserAttempt.findById(req.params.id)
      .populate('assessmentId')
      .populate('userId', 'name email');

    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    if (attempt.userId._id.toString() !== req.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(attempt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
