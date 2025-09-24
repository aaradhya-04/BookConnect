const axios = require('axios');
const bookModel = require('../models/bookModel');
const reviewModel = require('../models/reviewModel');

exports.listReviews = async (req, res, next) => {
  try {
    const reviews = await reviewModel.getAllWithUserAndBook();
    res.render('reviews', { reviews });
  } catch (err) {
    next(err);
  }
};

exports.showAdd = (req, res) => {
  if (!req.session.user) return res.redirect('/login'); // only logged-in users
  res.render('addReview');
};

exports.addReview = async (req, res, next) => {
  try {
    if (!req.session.user) return res.redirect('/login');

    const { isbn, title, rating, content } = req.body;

    let bookTitle = title;
    let authors = '';

    // If ISBN provided but no title → fetch from Google Books API
    if (isbn && !bookTitle) {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
      );
      if (response.data.totalItems > 0) {
        const info = response.data.items[0].volumeInfo;
        bookTitle = info.title;
        authors = (info.authors || []).join(', ');
      }
    }

    // find or create the book in DB
    const bookId = await bookModel.findOrCreate({
      title: bookTitle,
      authors,
      isbn
    });

    // save the review
    await reviewModel.create({
      user_id: req.session.user.id,
      book_id: bookId,
      rating,
      content
    });

    res.redirect('/reviews');
  } catch (err) {
    next(err);
  }
};
