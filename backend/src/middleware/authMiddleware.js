import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';

export const requireAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.cookie) {
    const rawCookies = req.headers.cookie.split(';');
    for (const c of rawCookies) {
      const [key, val] = c.trim().split('=');
      if (key === 'token') {
        token = val;
        break;
      }
    }
  }

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'skylounge_super_secret_jwt_key_2026_safe_and_secure_9760999444'
    );
    req.user = await User.findById(decoded.userId).select('-password');
    if (!req.user || !req.user.isActive) {
      res.status(401);
      throw new Error('User not found or account deactivated');
    }
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token invalid or expired');
  }
});

export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.cookie) {
    const rawCookies = req.headers.cookie.split(';');
    for (const c of rawCookies) {
      const [key, val] = c.trim().split('=');
      if (key === 'token') {
        token = val;
        break;
      }
    }
  }

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'skylounge_super_secret_jwt_key_2026_safe_and_secure_9760999444'
      );
      const user = await User.findById(decoded.userId).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Ignore token verification errors for optional auth
    }
  }
  next();
});

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, please log in');
    }
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Access forbidden. Role '${req.user.role}' is not authorized to access this resource.`);
    }
    next();
  };
};
