import { verifyToken } from '../utils/jwt.js';
import ApiError from '../errors/errors.js';

/**
 * Middleware to authenticate requests using JWT token
 * Expects token in Authorization header as: Bearer <token>
 * Attaches decoded user info to req.user
 * Skips authentication for /api/auth routes (except /api/auth/me)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const authenticate = async (req, res, next) => {
  try {
    // Skip authentication for auth routes (login, register, change-password)
    // Note: /api/auth/me handles its own authentication
    if (req.path.startsWith('/api/auth') && req.path !== '/api/auth/me') {
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authorization header with Bearer token is required');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = verifyToken(token);
      
      // Attach user info to request object
      req.user = decoded;
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

