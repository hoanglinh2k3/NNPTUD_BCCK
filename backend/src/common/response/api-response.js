function sendSuccess(res, message = 'Success', data = {}, meta = {}, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta
  });
}

function sendCreated(res, message = 'Created successfully', data = {}, meta = {}) {
  return sendSuccess(res, message, data, meta, 201);
}

function sendError(res, message = 'Request failed', errors = [], statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
}

module.exports = {
  sendSuccess,
  sendCreated,
  sendError
};
