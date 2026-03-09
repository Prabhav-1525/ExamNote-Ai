const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  avatar: { type: String, default: null },
  plan: { type: String, enum: ['free', 'pro'], default: 'free' },
  stats: {
    totalCards: { type: Number, default: 0 },
    studyTime: { type: Number, default: 0 }, // minutes
    filesProcessed: { type: Number, default: 0 },
    uploadsThisHour: { type: Number, default: 0 },
    lastUploadReset: { type: Date, default: Date.now }
  },
  settings: {
    darkMode: { type: Boolean, default: false },
    dailyGoal: { type: Number, default: 20 }
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Reset upload counter if needed
userSchema.methods.checkUploadLimit = function () {
  const oneHour = 60 * 60 * 1000;
  const now = Date.now();
  if (now - this.stats.lastUploadReset > oneHour) {
    this.stats.uploadsThisHour = 0;
    this.stats.lastUploadReset = now;
  }
  const limit = this.plan === 'pro' ? 50 : 10;
  return this.stats.uploadsThisHour < limit;
};

module.exports = mongoose.model('User', userSchema);
