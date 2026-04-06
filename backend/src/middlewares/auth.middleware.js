const AppError = require('../common/exceptions/app-error');
const { verifyAccessToken } = require('../common/utils/jwt.util');

function authMiddleware(req, _res, next) {
  const authorization = req.headers.authorization || '';
  const [type, token] = authorization.split(' ');

  if (type !== 'Bearer' || !token) {
    return next(new AppError('Unauthorized', 401));
  }

  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch (error) {
    return next(new AppError('Invalid or expired token', 401));
  }
}

module.exports = authMiddleware;
