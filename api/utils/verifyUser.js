import jwt from 'jsonwebtoken';
import { ErrorHandler } from '../utils/ErrorHandler.js';

export const verifyUser = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) return next(ErrorHandler(401, 'Unauthorized'));

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) return next(ErrorHandler(403, 'Forbidden'));

    // Fix: normalize token structure
    req.user = {
      id: user.userId,
      email: user.email,
      avatar: user.avatar,
    };

    next();
  });
};
