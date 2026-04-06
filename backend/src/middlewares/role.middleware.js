const AppError = require('../common/exceptions/app-error');

function roleMiddleware(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Forbidden', 403));
    }

    return next();
  };
}

module.exports = roleMiddleware;
