import roleSchema from '../schemas/roles.js';
import ApiError from '../errors/errors.js';

/**
 * Middleware to validate role data using Yup schema
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateRole = async (req, res, next) => {
  try {
    const validatedData = await roleSchema.validate(req.body, {
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
 * Middleware to validate role update data (partial validation)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateRoleUpdate = async (req, res, next) => {
  try {
    const partialSchema = roleSchema.partial();
    
    const validatedData = await partialSchema.validate(req.body, {
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
 * Middleware to validate role ID parameter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateRoleId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Role ID is required'
    });
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role ID format'
    });
  }

  next();
};

export default {
  validateRole,
  validateRoleUpdate,
  validateRoleId
};
