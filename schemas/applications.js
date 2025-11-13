import * as yup from 'yup';

const applicationSchema = yup.object({
  name: yup
    .string()
    .required('Application name is required')
    .min(1, 'Application name must not be empty')
    .max(255, 'Application name must be less than 255 characters')
    .trim(),
  
  key: yup
    .string()
    .required('Application key is required')
    .min(1, 'Application key must not be empty')
    .max(100, 'Application key must be less than 100 characters')
    .matches(
      /^[a-z0-9-]+$/,
      'Application key must contain only lowercase letters, numbers, and hyphens'
    )
    .trim(),
  
  is_multitenant: yup
    .boolean()
    .required('is_multitenant field is required')
    .typeError('is_multitenant must be a boolean value')
});

export default applicationSchema;
