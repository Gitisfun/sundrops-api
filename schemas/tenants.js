import * as yup from 'yup';

const tenantSchema = yup.object({
  application_id: yup
    .string()
    .required('Application ID is required')
    .uuid('Application ID must be a valid UUID'),
  
  name: yup
    .string()
    .required('Tenant name is required')
    .min(1, 'Tenant name must not be empty')
    .max(255, 'Tenant name must be less than 255 characters')
    .trim(),
  
  domain: yup
    .string()
    .required('Tenant domain is required')
    .min(1, 'Tenant domain must not be empty')
    .max(255, 'Tenant domain must be less than 255 characters')
    .matches(
      /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i,
      'Tenant domain must be a valid domain format'
    )
    .trim(),
  
  status: yup
    .string()
    .oneOf(['active', 'inactive', 'suspended'], 'Status must be one of: active, inactive, suspended')
});

export default tenantSchema;

