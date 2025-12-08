import * as yup from 'yup';

const userRoleSchema = yup.object({
  user_id: yup
    .string()
    .required('User ID is required')
    .uuid('User ID must be a valid UUID'),
  
  role_id: yup
    .string()
    .required('Role ID is required')
    .uuid('Role ID must be a valid UUID')
});

export default userRoleSchema;
