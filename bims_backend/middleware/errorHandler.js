const errorHandler = (err, req, res, next) => {
  console.error(err);

  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';
  let field = err.field || undefined;

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    status = 400;
    if (err.errors && err.errors.length > 0) {
      const firstError = err.errors[0];
      message = firstError.message;
      field = firstError.path;

      // Map stock validation message to requested message
      if (field === 'stock' && firstError.type === 'Validation error' && firstError.validatorKey === 'min') {
        message = 'Stock cannot go below zero';
      }
    }
  }

  const errorResponse = {
    error: {
      message
    }
  };

  if (field !== undefined) {
    errorResponse.error.field = field;
  }

  res.status(status).json(errorResponse);
};

module.exports = errorHandler;
