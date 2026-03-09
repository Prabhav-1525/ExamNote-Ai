const CardSet = require('../models/CardSet');
const User = require('../models/User');

const getAllCardSets = async (req, res, next) => {
  try {
    const { search, topic, status } = req.query;
    const query = { user: req.user._id };

    if (status) query.status = status;
    if (topic) query.topic = new RegExp(topic, 'i');
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { topic: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    const cardSets = await CardSet.find(query)
      .select('-flashcards.answer') // Don't expose answers in list
      .sort({ createdAt: -1 });

    res.json({ success: true, cardSets });
  } catch (err) {
    next(err);
  }
};

const getCardSet = async (req, res, next) => {
  try {
    const cardSet = await CardSet.findOne({ _id: req.params.id, user: req.user._id });
    if (!cardSet) {
      return res.status(404).json({ success: false, message: 'Card set not found' });
    }
    res.json({ success: true, cardSet });
  } catch (err) {
    next(err);
  }
};

const deleteCardSet = async (req, res, next) => {
  try {
    const cardSet = await CardSet.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!cardSet) {
      return res.status(404).json({ success: false, message: 'Card set not found' });
    }
    const deletedCount = cardSet.flashcards.length;
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.totalCards': -deletedCount }
    });
    res.json({ success: true, message: 'Card set deleted' });
  } catch (err) {
    next(err);
  }
};

const updateCardReview = async (req, res, next) => {
  try {
    const { cardId, quality } = req.body; // quality: 0-5 (SM-2 algorithm)
    const cardSet = await CardSet.findOne({ _id: req.params.id, user: req.user._id });

    if (!cardSet) return res.status(404).json({ success: false, message: 'Card set not found' });

    const card = cardSet.flashcards.id(cardId);
    if (!card) return res.status(404).json({ success: false, message: 'Card not found' });

    // SM-2 Spaced Repetition Algorithm
    if (quality >= 3) {
      if (card.repetitions === 0) card.interval = 1;
      else if (card.repetitions === 1) card.interval = 6;
      else card.interval = Math.round(card.interval * card.easeFactor);
      card.repetitions += 1;
      card.correct += 1;
    } else {
      card.repetitions = 0;
      card.interval = 1;
      card.incorrect += 1;
    }

    card.easeFactor = Math.max(1.3, card.easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    card.nextReview = new Date(Date.now() + card.interval * 24 * 60 * 60 * 1000);
    card.lastReviewed = new Date();
    card.difficulty = quality >= 4 ? 'easy' : quality >= 2 ? 'medium' : 'hard';

    await cardSet.save();
    res.json({ success: true, card });
  } catch (err) {
    next(err);
  }
};

const saveQuizAttempt = async (req, res, next) => {
  try {
    const { score, total } = req.body;
    const cardSet = await CardSet.findOne({ _id: req.params.id, user: req.user._id });
    if (!cardSet) return res.status(404).json({ success: false, message: 'Card set not found' });

    cardSet.quizAttempts.push({ score, total });
    await cardSet.save();
    res.json({ success: true, message: 'Quiz attempt saved' });
  } catch (err) {
    next(err);
  }
};

const updateStudyTime = async (req, res, next) => {
  try {
    const { minutes } = req.body;
    await CardSet.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $inc: { studyTime: minutes } }
    );
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.studyTime': minutes }
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

const exportCards = async (req, res, next) => {
  try {
    const { format } = req.query;
    const cardSet = await CardSet.findOne({ _id: req.params.id, user: req.user._id });
    if (!cardSet) return res.status(404).json({ success: false, message: 'Card set not found' });

    if (format === 'csv') {
      const rows = [['Question', 'Answer', 'Difficulty']];
      cardSet.flashcards.forEach(c => {
        rows.push([`"${c.question}"`, `"${c.answer}"`, c.difficulty]);
      });
      const csv = rows.map(r => r.join(',')).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${cardSet.title}.csv"`);
      return res.send(csv);
    }

    if (format === 'anki') {
      // Anki tab-separated format
      const lines = cardSet.flashcards.map(c => `${c.question}\t${c.answer}`);
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${cardSet.title}_anki.txt"`);
      return res.send(lines.join('\n'));
    }

    res.status(400).json({ success: false, message: 'Invalid format. Use csv or anki' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCardSets,
  getCardSet,
  deleteCardSet,
  updateCardReview,
  saveQuizAttempt,
  updateStudyTime,
  exportCards
};
