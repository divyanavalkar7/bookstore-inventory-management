const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Import routes and middleware
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

// Use routes
app.use('/', routes);

// Centralized Error Handling Middleware
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
