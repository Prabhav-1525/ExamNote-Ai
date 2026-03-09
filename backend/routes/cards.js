const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getAllCardSets,
  getCardSet,
  deleteCardSet,
  updateCardReview,
  saveQuizAttempt,
  updateStudyTime,
  exportCards
} = require('../controllers/cardsController');

const router = express.Router();

router.use(protect);

router.get('/', getAllCardSets);
router.get('/:id', getCardSet);
router.delete('/:id', deleteCardSet);
router.post('/:id/review', updateCardReview);
router.post('/:id/quiz', saveQuizAttempt);
router.post('/:id/study-time', updateStudyTime);
router.get('/:id/export', exportCards);

module.exports = router;
