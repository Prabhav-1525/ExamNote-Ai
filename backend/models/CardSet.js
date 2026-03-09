const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  nextReview: { type: Date, default: Date.now },
  interval: { type: Number, default: 1 }, // days
  repetitions: { type: Number, default: 0 },
  easeFactor: { type: Number, default: 2.5 },
  lastReviewed: { type: Date, default: null },
  correct: { type: Number, default: 0 },
  incorrect: { type: Number, default: 0 }
});

const quickNoteSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  bullets: [{ type: String }]
});

const soundCardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  script: { type: String, required: true },
  duration: { type: String, default: '~1 min' }
});

const videoCardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  concept: { type: String, required: true },
  script: { type: String, required: true },
  visualIdeas: [{ type: String }],
  duration: { type: String, default: '30 sec' },
  youtubeQuery: { type: String, default: '' }
});

const cardSetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
sourceFile: {
    name: { type: String, default: '' },
    size: { type: Number, default: 0 },
    type: { type: String, default: '' }
  },
  topic: { type: String, default: 'General' },
  tags: [{ type: String }],
  flashcards: [flashcardSchema],
  quickNotes: [quickNoteSchema],
  soundCards: [soundCardSchema],
  videoCards: [videoCardSchema],
  status: { type: String, enum: ['processing', 'ready', 'error'], default: 'processing' },
  errorMessage: { type: String, default: null },
  progress: {
    totalCards: { type: Number, default: 0 },
    reviewedCards: { type: Number, default: 0 },
    masteredCards: { type: Number, default: 0 }
  },
  quizAttempts: [{
    score: Number,
    total: Number,
    date: { type: Date, default: Date.now }
  }],
  studyTime: { type: Number, default: 0 }
}, { timestamps: true });

// Update progress on save
cardSetSchema.pre('save', function (next) {
  this.progress.totalCards = this.flashcards.length;
  this.progress.reviewedCards = this.flashcards.filter(c => c.lastReviewed).length;
  this.progress.masteredCards = this.flashcards.filter(c => c.repetitions >= 3 && c.difficulty === 'easy').length;
  next();
});

module.exports = mongoose.model('CardSet', cardSetSchema);
