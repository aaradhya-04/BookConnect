const axios = require('axios');
const bookModel = require('../models/bookModel');
const reviewModel = require('../models/reviewModel');

/**
 * List all reviews with user and book information
 */
exports.listReviews = async (req, res, next) => {
  try {
    const reviews = await reviewModel.getAllWithUserAndBook();
    res.render('reviews', { reviews });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    next(err);
  }
};

/**
 * Show the add review form
 */
exports.showAdd = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    res.render('addReview', { 
      error: null, 
      formData: null 
    });
  } catch (err) {
    console.error('Error showing add review form:', err);
    next(err);
  }
};

/**
 * Add a new review
 */
exports.addReview = async (req, res, next) => {
  try {
    // Check if user is logged in
    if (!req.session.user) {
      return res.redirect('/login');
    }

    const { isbn, title, rating, content } = req.body;

    // Input validation
    if (!rating || !content) {
      return res.status(400).render('addReview', {
        error: 'Rating and content are required fields',
        formData: req.body
      });
    }

    // Validate rating is a number between 1-5
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).render('addReview', {
        error: 'Rating must be a number between 1 and 5',
        formData: req.body
      });
    }

    let bookTitle = title;
    let authors = '';

    // If ISBN provided but no title → fetch from Google Books API
    if (isbn && !bookTitle) {
      try {
        const response = await axios.get(
          `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`,
          { timeout: 5000 } // 5 second timeout
        );
        
        if (response.data.totalItems > 0) {
          const info = response.data.items[0].volumeInfo;
          bookTitle = info.title;
          authors = (info.authors || []).join(', ');
        } else {
          return res.status(400).render('addReview', {
            error: 'No book found with the provided ISBN',
            formData: req.body
          });
        }
      } catch (apiError) {
        console.error('Google Books API error:', apiError);
        return res.status(400).render('addReview', {
          error: 'Unable to fetch book information. Please provide a title manually.',
          formData: req.body
        });
      }
    }

    // Ensure we have a book title
    if (!bookTitle) {
      return res.status(400).render('addReview', {
        error: 'Book title is required',
        formData: req.body
      });
    }

    // Find or create the book in DB
    const bookId = await bookModel.findOrCreate({
      title: bookTitle,
      authors,
      isbn
    });

    // Save the review
    await reviewModel.create({
      user_id: req.session.user.id,
      book_id: bookId,
      rating: ratingNum,
      content: content.trim()
    });

    res.redirect('/reviews');
  } catch (err) {
    console.error('Error adding review:', err);
    next(err);
  }
};
