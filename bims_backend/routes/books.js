const express = require('express');
const router = express.Router();
const { Book, Author } = require('../models');

// GET /books - List all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.findAll({
      include: [{ model: Author, as: 'author' }]
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /books - Create a new book
router.post('/', async (req, res) => {
  try {
    const { title, isbn, price, stock, authorId } = req.body;
    const book = await Book.create({ title, isbn, price, stock, authorId });
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /books/:isbn - Delete a book by isbn
router.delete('/:isbn', async (req, res) => {
  try {
    const book = await Book.findOne({ where: { isbn: req.params.isbn } });
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    await book.destroy();
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /books/:isbn/stock - Adjust/Update stock
router.put('/:isbn/stock', async (req, res) => {
  try {
    const { stock } = req.body;
    const book = await Book.findOne({ where: { isbn: req.params.isbn } });
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    book.stock = stock;
    await book.save();
    res.json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
