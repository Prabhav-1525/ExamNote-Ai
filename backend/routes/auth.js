const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: { success: false, message: 'Too many attempts, please try again later' }
});

router.post('/register', authLimiter, [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], register);

router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], login);

router.get('/me', protect, getMe);

module.exports = router;
