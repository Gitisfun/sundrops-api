import * as yup from 'yup';

// Schema for creating an API key
export const createApiKeySchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(1, 'Name must not be empty')
    .max(255, 'Name must be less than 255 characters')
    .trim(),
  
  application_id: yup
    .string()
    .uuid('Application ID must be a valid UUID')
    .nullable(),
  
  tenant_id: yup
    .string()
    .uuid('Tenant ID must be a valid UUID')
    .nullable(),
  
  expires_at: yup
    .date()
    .nullable()
    .typeError('Expires at must be a valid date-time')
    .test('future-date', 'Expiration date must be in the future', function(value) {
      if (!value) return true; // Allow null/undefined
      return new Date(value) > new Date();
    })
});

// Schema for query parameters when getting API keys
export const getApiKeysQuerySchema = yup.object({
  limit: yup
    .number()
    .integer('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(1000, 'Limit must be at most 1000')
    .nullable()
    .transform((value, originalValue) => {
      // Handle empty strings and convert to null
      if (originalValue === '' || originalValue === null || originalValue === undefined) {
        return null;
      }
      return value;
    }),
  
  offset: yup
    .number()
    .integer('Offset must be an integer')
    .min(0, 'Offset must be at least 0')
    .nullable()
    .transform((value, originalValue) => {
      if (originalValue === '' || originalValue === null || originalValue === undefined) {
        return null;
      }
      return value;
    }),
  
  orderBy: yup
    .string()
    .oneOf(
      ['created_at', 'updated_at', 'name', 'expires_at', 'last_used_at'],
      'Order by must be one of: created_at, updated_at, name, expires_at, last_used_at'
    )
    .nullable()
    .transform((value, originalValue) => {
      if (originalValue === '' || originalValue === null || originalValue === undefined) {
        return null;
      }
      return value;
    }),
  
  tenant_id: yup
    .string()
    .uuid('Tenant ID must be a valid UUID')
    .nullable()
    .transform((value, originalValue) => {
      if (originalValue === '' || originalValue === null || originalValue === undefined) {
        return null;
      }
      return value;
    })
});

export default {
  createApiKeySchema,
  getApiKeysQuerySchema
};

