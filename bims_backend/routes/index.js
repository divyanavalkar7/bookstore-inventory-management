const express = require('express');
const router = express.Router();

const authorRouter = require('./authors');
const bookRouter = require('./books');

router.use('/authors', authorRouter);
router.use('/books', bookRouter);

module.exports = router;
