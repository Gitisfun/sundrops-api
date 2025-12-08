import { createApiKeySchema, getApiKeysQuerySchema } from '../schemas/apiKeys.js';
import ApiError from '../errors/errors.js';

/**
 * Middleware to validate API key creation data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateCreateApiKey = async (req, res, next) => {
  try {
    // Validate the request body against the create API key schema
    const validatedData = await createApiKeySchema.validate(req.body, {
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
 * Middleware to validate query parameters for getting API keys
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateGetApiKeysQuery = async (req, res, next) => {
  try {
    // Validate the query parameters against the query schema
    const validatedData = await getApiKeysQuerySchema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    // Store validated data in a custom property (req.query is read-only)
    req.validatedQuery = validatedData;
    
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

export default {
  validateCreateApiKey,
  validateGetApiKeysQuery
};

