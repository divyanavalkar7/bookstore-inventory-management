const express = require('express');
const router = express.Router();
const { Author, Book } = require('../models');

// GET /authors - List all authors
router.get('/', async (req, res) => {
  try {
    const authors = await Author.findAll({
      include: [{ model: Book, as: 'books' }]
    });
    res.json(authors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /authors/:id - Get a single author details with associated books
router.get('/:id', async (req, res) => {
  try {
    const author = await Author.findByPk(req.params.id, {
      include: [{ model: Book, as: 'books' }]
    });
    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }
    res.json(author);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /authors - Create a new author
router.post('/', async (req, res) => {
  try {
    const { name, bio } = req.body;
    const author = await Author.create({ name, bio });
    res.status(201).json(author);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /authors/:id - Delete an author by id
router.delete('/:id', async (req, res) => {
  try {
    const author = await Author.findByPk(req.params.id);
    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }
    await author.destroy();
    res.json({ message: 'Author and associated books deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
