import express from 'express';
import Topic from '../models/Topic.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { name, description, companyId } = req.body;

    const topic = new Topic({
      name,
      description,
      companyId,
      userId: req.userId
    });

    await topic.save();
    res.status(201).json(topic);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/company/:companyId', auth, async (req, res) => {
  try {
    const topics = await Topic.find({
      companyId: req.params.companyId,
      userId: req.userId
    }).sort({ createdAt: -1 });

    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const topic = await Topic.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    res.json(topic);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const topic = await Topic.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
