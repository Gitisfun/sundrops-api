import * as yup from 'yup';

const addressSchema = yup.object({
  street: yup
    .string()
    .max(255, 'Street must be less than 255 characters')
    .trim(),
  
  house: yup
    .string()
    .max(50, 'House number must be less than 50 characters')
    .trim(),
  
  box: yup
    .string()
    .max(50, 'Box must be less than 50 characters')
    .trim(),
  
  postalcode: yup
    .string()
    .max(20, 'Postal code must be less than 20 characters')
    .trim(),
  
  city: yup
    .string()
    .max(100, 'City must be less than 100 characters')
    .trim(),
  
  country: yup
    .string()
    .max(100, 'Country must be less than 100 characters')
    .trim(),
  
  type: yup
    .string()
    .max(50, 'Type must be less than 50 characters')
    .trim()
});

export default addressSchema;
