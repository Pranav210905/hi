import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  answer: {
    type: String
  },
  isCorrect: {
    type: Boolean
  },
  timeTaken: {
    type: Number,
    default: 0
  },
  marksObtained: {
    type: Number,
    default: 0
  }
});

const userAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true
  },
  answers: [answerSchema],
  totalScore: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  timeTaken: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  performance: {
    accuracy: Number,
    speed: Number,
    sectionWise: [{
      section: String,
      correct: Number,
      total: Number,
      avgTime: Number
    }]
  }
});

const UserAttempt = mongoose.model('UserAttempt', userAttemptSchema);

export default UserAttempt;
