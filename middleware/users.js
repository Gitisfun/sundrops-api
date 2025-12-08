import userSchema from '../schemas/users.js';
import ApiError from '../errors/errors.js';

/**
 * Middleware to validate user data using Yup schema
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateUser = async (req, res, next) => {
  try {
    // Validate the request body against the user schema
    const validatedData = await userSchema.validate(req.body, {
      abortEarly: false, // Return all validation errors, not just the first one
      stripUnknown: true  // Remove fields not defined in the schema
    });

    // Replace req.body with the validated and sanitized data
    req.body = validatedData;
    
    next();
  } catch (error) {
    if (error.name === 'ValidationError') {
      // Format Yup validation errors into a more user-friendly format
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

    // Handle other errors
    next(ApiError.internal('Validation middleware error: ' + error.message));
  }
};

/**
 * Middleware to validate user update data (partial validation)
 * This allows partial updates where not all fields are required
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateUserUpdate = async (req, res, next) => {
  try {
    // Create a partial schema that makes all fields optional
    const partialSchema = userSchema.partial();
    
    // Validate the request body against the partial schema
    const validatedData = await partialSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    // Replace req.body with the validated and sanitized data
    req.body = validatedData;
    
    next();
  } catch (error) {
    if (error.name === 'ValidationError') {
      // Format Yup validation errors into a more user-friendly format
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

    // Handle other errors
    next(ApiError.internal('Validation middleware error: ' + error.message));
  }
};

/**
 * Middleware to validate user ID parameter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateUserId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  // Basic UUID validation (assuming Supabase uses UUIDs)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID format'
    });
  }

  next();
};

export default {
  validateUser,
  validateUserUpdate,
  validateUserId
};

