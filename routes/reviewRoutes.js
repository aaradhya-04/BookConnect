const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' });

// Show all reviews
router.get('/', reviewController.listReviews);

// Show add review form
router.get('/add', reviewController.showAdd);

// Submit new review (with optional file upload)
router.post('/', upload.single('cover'), reviewController.addReview);

module.exports = router;