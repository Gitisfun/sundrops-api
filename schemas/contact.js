import * as yup from 'yup';

const contactSchema = yup.object({
  phone: yup
    .string()
    .max(50, 'Phone must be less than 50 characters')
    .trim()
});

export default contactSchema;
