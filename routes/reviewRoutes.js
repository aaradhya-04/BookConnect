const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// show all reviews
router.get('/', reviewController.listReviews);

// show add review form
router.get('/add', reviewController.showAdd);

// submit new review
router.post('/add', reviewController.addReview);

module.exports = router;

const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' });
router.post('/add', upload.single('cover'), reviewController.addReview);
