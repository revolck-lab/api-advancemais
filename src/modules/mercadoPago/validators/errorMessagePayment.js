const errorMessagePayment = () => ({
  company_id: {
    required: 'The "company_id" field is required',
    invalid: 'The "company_id" field must be a valid integer',
  },
  package_id: {
    required: 'The "package_id" field is required',
    invalid: 'The "package_id" field must be a valid integer',
  },
  payment_method: {
    required: 'The "payment_method" field is required',
  },
});

module.exports = errorMessagePayment;