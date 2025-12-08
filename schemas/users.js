import * as yup from 'yup';

const userSchema = yup.object({
  tenant_id: yup
    .string()
    .uuid('Tenant ID must be a valid UUID'),
  
  application_id: yup
    .string()
    .uuid('Application ID must be a valid UUID'),
  
  email: yup
    .string()
    .required('Email is required')
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
  
  password_hash: yup
    .string()
    .max(255, 'Password hash must be less than 255 characters'),
  
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
    .oneOf(['active', 'inactive', 'suspended'], 'Status must be one of: active, inactive, suspended'),
  
  last_login_at: yup
    .date()
    .nullable()
    .typeError('Last login at must be a valid date')
});

export default userSchema;

