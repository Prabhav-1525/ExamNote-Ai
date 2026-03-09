const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.use(protect);

router.patch('/settings', async (req, res, next) => {
  try {
    const { darkMode, dailyGoal } = req.body;
    const update = {};
    if (darkMode !== undefined) update['settings.darkMode'] = darkMode;
    if (dailyGoal !== undefined) update['settings.dailyGoal'] = dailyGoal;

    const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true });
    res.json({ success: true, settings: user.settings });
  } catch (err) {
    next(err);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, stats: user.stats });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
