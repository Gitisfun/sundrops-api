import * as yup from 'yup';

const roleSchema = yup.object({
  application_id: yup
    .string()
    .uuid('Application ID must be a valid UUID'),
  
  tenant_id: yup
    .string()
    .uuid('Tenant ID must be a valid UUID'),
  
  name: yup
    .string()
    .required('Name is required')
    .min(1, 'Name must not be empty')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  
  description: yup
    .string()
    .max(500, 'Description must be less than 500 characters')
    .trim()
    .nullable(),
  
  is_system: yup
    .boolean()
    .default(false)
});

export default roleSchema;
