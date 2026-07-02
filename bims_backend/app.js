const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Import routers
const authorRouter = require('./routes/authors');
const bookRouter = require('./routes/books');

// Use routers
app.use('/authors', authorRouter);
app.use('/books', bookRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
