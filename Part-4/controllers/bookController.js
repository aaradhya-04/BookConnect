const fs = require('fs');
const path = require('path');
const bookModel = require('../models-mongo/bookModel');
const reviewModel = require('../models-mongo/reviewModel');

async function removeCoverIfExists(coverUrl) {
  if (!coverUrl) return;
  try {
    const cleanPath = coverUrl.startsWith('/') ? coverUrl.slice(1) : coverUrl;
    const absolute = path.join(__dirname, '..', 'public', cleanPath);
    await fs.promises.unlink(absolute);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Failed to remove cover', err);
    }
  }
}

exports.listBooks = async (req, res, next) => {
  try {
    // Support filters: q (title), author, minRating (not yet aggregated), isbn
    const { q, author } = req.query;
    let books = await bookModel.getAll();

    if (q) {
      const qLower = q.toLowerCase();
      books = books.filter(b => (b.title || '').toLowerCase().includes(qLower));
    }
    if (author) {
      const aLower = author.toLowerCase();
      books = books.filter(b => (b.authors || '').toLowerCase().includes(aLower));
    }

    res.render('books', { books, filters: { q, author } });
  } catch (err) {
    next(err);
  }
};

exports.showBook = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).render('404');
    }
    
    const book = await bookModel.findById(id);
    if (!book) {
      return res.status(404).render('404');
    }
    
    // Increment views (don't wait for it)
    bookModel.incrementViews(id).catch(err => {
      console.error('Error incrementing views:', err);
    });
    
    book.views = (book.views || 0) + 1;
    
    // Get reviews for this book
    const reviews = await reviewModel.getByBookId(id);
    
    res.render('bookDetail', { book, reviews });
  } catch (err) {
    console.error('Error in showBook:', err);
    next(err);
  }
};

exports.showAddBook = async (req, res, next) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(403).render('error', { error: { message: 'Forbidden' } });
  }
  res.render('adminAddBook', { error: null });
};

exports.addBook = async (req, res, next) => {
  try {
    if (!req.session.user || !req.session.user.isAdmin) {
      return res.status(403).render('error', { error: { message: 'Forbidden' } });
    }
    const { title, authors, isbn } = req.body;
    if (!title) return res.render('adminAddBook', { error: 'Title is required' });
    const coverUrl = req.file ? `/uploads/${req.file.filename}` : null;
    let existing = null;
    if (isbn) {
      existing = await bookModel.findByISBN(isbn);
    }
    if (!existing) {
      existing = await bookModel.findByTitle(title);
    }
    if (existing) {
      const updateData = { title, authors, isbn };
      if (coverUrl) {
        updateData.coverUrl = coverUrl;
        await removeCoverIfExists(existing.cover_url);
      }
      await bookModel.update(existing.id, updateData);
    } else {
      await bookModel.create({ title, authors, isbn, coverUrl });
    }
    res.redirect('/admin');
  } catch (err) { next(err); }
};

exports.deleteBook = async (req, res, next) => {
  try {
    if (!req.session.user || !req.session.user.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Book ID is required' });
    }
    
    const book = await bookModel.findById(id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    const deleted = await bookModel.delete(id);
    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete book' });
    }
    
    // Remove cover file if exists
    if (book.cover_url) {
      await removeCoverIfExists(book.cover_url);
    }
    
    // Also delete associated reviews
    try {
      await reviewModel.deleteByBookId(id);
    } catch (reviewErr) {
      console.error('Error deleting reviews:', reviewErr);
      // Continue even if review deletion fails
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error in deleteBook:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    if (!req.session.user || !req.session.user.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const id = req.params.id;
    const ok = await reviewModel.delete(id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
};

module.exports = exports;
