const express = require('express');
const router = express.Router();
const reviewModel = require('../models/reviewModel');

router.get('/reviews', async (req, res, next) => {
  try {
    const reviews = await reviewModel.getAllWithUserAndBook();
    res.json(reviews);
  } catch (err) { next(err); }
});

module.exports = router;
