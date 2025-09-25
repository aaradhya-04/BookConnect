const db = require('../db');

class BookModel {
  async findOrCreate(bookData) {
    const { title, authors, isbn } = bookData;
    
    // First, try to find existing book
    const existingBook = await this.findByISBN(isbn);
    if (existingBook) {
      return existingBook.id;
    }
    
    // If not found, create new book
    const query = 'INSERT INTO books (title, authors, isbn) VALUES (?, ?, ?)';
    const [result] = await db.execute(query, [title, authors, isbn]);
    return result.insertId;
  }
  
  async findByISBN(isbn) {
    if (!isbn) return null;
    const query = 'SELECT * FROM books WHERE isbn = ?';
    const [rows] = await db.execute(query, [isbn]);
    return rows[0] || null;
  }
  
  async findById(id) {
    const query = 'SELECT * FROM books WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
  }
  
  async getAll() {
    const query = 'SELECT * FROM books ORDER BY title';
    const [rows] = await db.execute(query);
    return rows;
  }
}

module.exports = new BookModel();
