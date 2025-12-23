import { verifyToken } from '../utils/jwt.js';
import ApiError from '../errors/errors.js';
import usersService from '../services/users.js';

/**
 * Middleware to authenticate requests using JWT token
 * Expects token in Authorization header as: Bearer <token>
 * Verifies that the user exists, is active, and is verified
 * Attaches fresh user info to req.user
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authorization header with Bearer token is required');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = verifyToken(token);
      
      // Fetch fresh user data from database
      const user = await usersService.getById(decoded.id);
      
      // Check if user is active
      if (user.status !== 'active') {
        throw ApiError.forbidden('User account is not active');
      }
      
      // Check if user email is verified
      if (!user.is_verified) {
        throw ApiError.forbidden('Email address has not been verified');
      }
      
      // Attach fresh user info to request object (excluding sensitive data)
      const { password_hash, email_verification_token, ...userInfo } = user;
      req.user = userInfo;
      next();
    } catch (error) {
      if (error.message === 'Invalid or expired token') {
        throw ApiError.unauthorized('Invalid or expired token');
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(ApiError.unauthorized('Authentication failed'));
    }
  }
};

export default authenticate;

