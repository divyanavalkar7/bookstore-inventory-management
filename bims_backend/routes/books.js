const express = require('express');
const router = express.Router();
const { Book, Author } = require('../models');
const { Op } = require('sequelize');

// GET /books - List all books (with inStock and minPrice filters)
router.get('/', async (req, res, next) => {
  try {
    const { inStock, minPrice } = req.query;
    const where = {};

    if (inStock === 'true') {
      where.stock = { [Op.gt]: 0 };
    } else if (inStock === 'false') {
      where.stock = 0;
    }

    if (minPrice !== undefined) {
      where.price = { [Op.gte]: parseFloat(minPrice) };
    }

    const books = await Book.findAll({
      where,
      include: [{ model: Author, as: 'author' }]
    });
    res.json(books);
  } catch (error) {
    next(error);
  }
});

// POST /books - Create a new book with author verification
router.post('/', async (req, res, next) => {
  try {
    const { title, isbn, price, stock, authorId } = req.body;

    // REQ-4.2 - Must validate that authorId references an existing author
    const author = await Author.findByPk(authorId);
    if (!author) {
      const err = new Error('Author does not exist');
      err.status = 400;
      err.field = 'authorId';
      throw err;
    }

    const book = Book.build({ title, isbn, price, stock, authorId });
    await book.validate();
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    next(error);
  }
});

// DELETE /books/:isbn - Delete a book by isbn
router.delete('/:isbn', async (req, res, next) => {
  try {
    const book = await Book.findOne({ where: { isbn: req.params.isbn } });
    if (!book) {
      const err = new Error('Book not found');
      err.status = 404;
      throw err;
    }
    await book.destroy();
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// PUT /books/:isbn/stock - Adjust/Update stock
router.put('/:isbn/stock', async (req, res, next) => {
  try {
    const { stock } = req.body;
    const book = await Book.findOne({ where: { isbn: req.params.isbn } });
    if (!book) {
      const err = new Error('Book not found');
      err.status = 404;
      throw err;
    }
    book.stock = stock;
    await book.validate();
    await book.save();
    res.json(book);
  } catch (error) {
    next(error);
  }
});

// PATCH /books/:id/stock - Adjust stock by signed delta (change)
router.patch('/:id/stock', async (req, res, next) => {
  try {
    const { change } = req.body;
    if (change === undefined) {
      const err = new Error('Stock increment is required');
      err.status = 400;
      err.field = 'change';
      throw err;
    }
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      const err = new Error('Book not found');
      err.status = 404;
      throw err;
    }

    // Adjust stock by the signed delta
    book.stock = book.stock + change;
    await book.validate();
    await book.save();
    res.json(book);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
