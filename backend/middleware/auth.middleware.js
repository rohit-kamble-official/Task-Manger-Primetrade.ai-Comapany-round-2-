const { verifyToken } = require('../utils/jwt.utils');
const User = require('../models/User.model');
const { sendError } = require('../utils/response.utils');

// Protect routes — requires valid JWT
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 401, 'Access denied. No token provided.');
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return sendError(res, 401, 'Token is invalid. User not found.');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return sendError(res, 401, 'Invalid token.');
    }
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token has expired. Please login again.');
    }
    return sendError(res, 500, 'Authentication error.');
  }
};

// Admin-only access
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return sendError(res, 403, 'Access denied. Admin only.');
};

module.exports = { protect, adminOnly };
