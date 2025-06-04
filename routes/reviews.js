const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Review = require('../models/Review');
const Book = require('../models/Book');

// Submit review
router.post('/:bookId/reviews', auth, async (req, res) => {
  const { rating, comment } = req.body;
  const review = new Review({
    book: req.params.bookId,
    user: req.user.userId,
    rating,
    comment,
  });
  await review.save();
  await Book.findByIdAndUpdate(req.params.bookId, { $push: { reviews: review._id } });
  res.status(201).json(review);
});

// Update review
router.put('/:id', auth, async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review || review.user.toString() !== req.user.userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  Object.assign(review, req.body);
  await review.save();
  res.json(review);
});

// Delete review
router.delete('/:id', auth, async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review || review.user.toString() !== req.user.userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  await review.remove();
  res.json({ message: 'Review deleted' });
});

module.exports = router;
