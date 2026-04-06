function notFoundMiddleware(_req, res) {
  return res.status(404).json({
    success: false,
    message: 'Route not found',
    errors: []
  });
}

module.exports = notFoundMiddleware;
