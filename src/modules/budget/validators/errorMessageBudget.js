const errorMessagesBudget = () => ({
  service_id: {
    required: 'The "service_id" field is required',
    invalid: 'The "service_id" field must be a valid integer',
  },
  first_name: {
    required: 'The "first_name" field is required',
    empty: 'The "first_name" field cannot be empty',
    min: 'The "first_name" field must have at least 3 characters',
    max: 'The "first_name" field must have no more than 100 characters',
  },
  last_name: {
    required: 'The "last_name" field is required',
    empty: 'The "last_name" field cannot be empty',
    min: 'The "last_name" field must have at least 3 characters',
    max: 'The "last_name" field must have no more than 100 characters',
  },
  company_name: {
    required: 'The "company_name" field is required',
    empty: 'The "company_name" field cannot be empty',
    min: 'The "company_name" field must have at least 2 characters',
    max: 'The "company_name" field must have no more than 100 characters',
  },
  position: {
    required: 'The "position" field is required',
    empty: 'The "position" field cannot be empty',
    min: 'The "position" field must have at least 2 characters',
    max: 'The "position" field must have no more than 100 characters',
  },
  email: {
    required: 'The "email" field is required',
    invalid: 'The "email" field must be a valid email address',
  },
  address: {
    max: 'The "address" field must have no more than 255 characters',
  },
  state_id: {
    required: 'The "state_id" field is required',
    invalid: 'The "state_id" field must be a valid integer',
  },
  phone: {
    required: 'The "phone" field is required',
    invalid: 'The "phone" field must be a valid phone number',
  },
  city: {
    required: 'The "city" field is required',
  },
  postal_code: {
    invalid: 'The "zip_code" field must be in a valid format (e.g., 12345-678)',
  },
});

module.exports = errorMessagesBudget;
