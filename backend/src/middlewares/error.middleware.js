const multer = require('multer');
const { ZodError } = require('zod');
const AppError = require('../common/exceptions/app-error');

function errorMiddleware(error, _req, res, _next) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    });
  }

  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: error.message,
      errors: []
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors || []
    });
  }

  return res.status(500).json({
    success: false,
    message: error.message || 'Internal server error',
    errors: []
  });
}

module.exports = errorMiddleware;
