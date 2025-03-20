const errorMessageSignature = () => ({
  company_id: {
    required: 'The "company_id" field is required',
    invalid: 'The "company_id" field must be a valid integer',
  },
  package_id: {
    required: 'The "package_id" field is required',
    invalid: 'The "package_id" field must be a valid integer',
  },
  status: {
    required: 'The "status" field is required',
    invalid: 'The "status" field must be one of the following: active, canceled, expired',
    empty: ' The "status" field must be empty',
  },
});

module.exports = errorMessageSignature;
