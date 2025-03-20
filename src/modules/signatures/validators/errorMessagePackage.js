const errorMessagePackage = () => ({
  name: {
    required: 'The "name" field is required',
    empty: 'The "name" field cannot be empty',
    min: 'The "name" field must have at least 3 characters',
    max: 'The "name" field must have no more than 100 characters',
  },
  vacancy_limit: {
    required: 'The "vacancy_limit" field is required',
    invalid: 'The "vacancy_limit" field must be a valid integer',
  },
  price: {
    required: 'The "price" field is required',
    invalid: 'The "price" field must be a valid decimal number',
  },
  periodicity: {
    required: 'The "periodicity" field is required',
    invalid: 'The "periodicity" field must be a valid periodicity type',
    empty: 'The "periodicity" field cannot be empty',
  },
  featured: {
    required: 'The "featured" field is required',
    invalid: 'The "featured" field must be a valid boolean value',
  },
});

module.exports = errorMessagePackage;
