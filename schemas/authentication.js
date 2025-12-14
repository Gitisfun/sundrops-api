import * as yup from 'yup';

// Register schema - tenant_id comes from API key, not request body
export const registerSchema = yup.object({
  
  email: yup
    .string()
    .email('Email must be a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .trim()
    .lowercase(),
    
  username: yup
    .string()
    .min(1, 'Username must not be empty')
    .max(100, 'Username must be less than 100 characters')
    .matches(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, hyphens (-), and underscores (_). No spaces allowed.'
    )
    .trim(),
  
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(255, 'Password must be less than 255 characters'),
  
  first_name: yup
    .string()
    .required('First name is required')
    .min(1, 'First name must not be empty')
    .max(100, 'First name must be less than 100 characters')
    .trim(),
  
  last_name: yup
    .string()
    .required('Last name is required')
    .min(1, 'Last name must not be empty')
    .max(100, 'Last name must be less than 100 characters')
    .trim(),
  
  status: yup
    .string()
    .oneOf(['active', 'inactive', 'suspended'], 'Status must be one of: active, inactive, suspended')
}).test(
  'email-or-username',
  'Either email or username must be provided',
  (value) => !!(value.email || value.username)
);

// Login schema - tenant_id comes from API key, not request body
export const loginSchema = yup.object({
  identifier: yup
    .string()
    .required('Email or username is required')
    .trim(),
  
  password: yup
    .string()
    .required('Password is required')
});

// Change password schema - tenant_id comes from API key, not request body
export const changePasswordSchema = yup.object({
  user_id: yup
    .string()
    .required('User ID is required')
    .uuid('User ID must be a valid UUID'),
  
  current_password: yup
    .string()
    .required('Current password is required'),
  
  new_password: yup
    .string()
    .required('New password is required')
    .min(8, 'New password must be at least 8 characters')
    .max(255, 'New password must be less than 255 characters')
});

export default {
  registerSchema,
  loginSchema,
  changePasswordSchema
};

