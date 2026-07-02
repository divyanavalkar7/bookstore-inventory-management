const express = require('express');
const router = express.Router();
const { Author, Book } = require('../models');

// GET /authors - List all authors
router.get('/', async (req, res, next) => {
  try {
    const authors = await Author.findAll({
      include: [{ model: Book, as: 'books' }]
    });
    res.json(authors);
  } catch (error) {
    next(error);
  }
});

// GET /authors/:id - Get a single author details with associated books
router.get('/:id', async (req, res, next) => {
  try {
    const author = await Author.findByPk(req.params.id, {
      include: [{ model: Book, as: 'books' }]
    });
    if (!author) {
      const err = new Error('Author not found');
      err.status = 404;
      throw err;
    }
    res.json(author);
  } catch (error) {
    next(error);
  }
});

// POST /authors - Create a new author
router.post('/', async (req, res, next) => {
  try {
    const { name, bio } = req.body;
    
    if (!name || !name.trim()) {
      const err = new Error('Author name cannot be empty');
      err.status = 400;
      err.field = 'name';
      throw err;
    }

    const { Op } = require('sequelize');
    const existingAuthor = await Author.findOne({
      where: {
        name: {
          [Op.iLike]: name.trim()
        }
      }
    });

    if (existingAuthor) {
      const err = new Error('Author name must be unique');
      err.status = 400;
      err.field = 'name';
      throw err;
    }

    const author = Author.build({ name: name.trim(), bio });
    await author.validate();
    await author.save();
    res.status(201).json(author);
  } catch (error) {
    next(error);
  }
});

// DELETE /authors/:id - Delete an author by id
router.delete('/:id', async (req, res, next) => {
  try {
    const author = await Author.findByPk(req.params.id, {
      include: [{ model: Book, as: 'books' }]
    });
    if (!author) {
      const err = new Error('Author not found');
      err.status = 404;
      throw err;
    }
    if (author.books && author.books.length > 0) {
      const err = new Error('Cannot delete author with associated books');
      err.status = 400;
      throw err;
    }
    await author.destroy();
    res.json({ message: 'Author deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
