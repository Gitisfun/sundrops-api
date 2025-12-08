import userRoleSchema from '../schemas/userRoles.js';
import ApiError from '../errors/errors.js';

/**
 * Middleware to validate user role assignment data using Yup schema
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateUserRole = async (req, res, next) => {
  try {
    const validatedData = await userRoleSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    req.body = validatedData;
    
    next();
  } catch (error) {
    if (error.name === 'ValidationError') {
      const formattedErrors = error.inner.map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formattedErrors
      });
    }

    next(ApiError.internal('Validation middleware error: ' + error.message));
  }
};

/**
 * Middleware to validate user role assignment ID parameter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateUserRoleId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'User role ID is required'
    });
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user role ID format'
    });
  }

  next();
};

/**
 * Middleware to validate user ID parameter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateUserId = (req, res, next) => {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(userId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID format'
    });
  }

  next();
};

/**
 * Middleware to validate role ID parameter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateRoleIdParam = (req, res, next) => {
  const { roleId } = req.params;
  
  if (!roleId) {
    return res.status(400).json({
      success: false,
      message: 'Role ID is required'
    });
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(roleId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role ID format'
    });
  }

  next();
};

export default {
  validateUserRole,
  validateUserRoleId,
  validateUserId,
  validateRoleIdParam
};
