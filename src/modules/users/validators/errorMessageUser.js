const messageErrorUser = () => ({
  name: {
    nameFormat: "The name must contain only letters and spaces.",
    empty: "The name cannot be empty.",
    max: (max) => `The name must have a maximum of ${max} characters.`,
    min: (min) => `The name must have at least ${min} characters.`,
    required: "The name is required.",
  },
  email: {
    email: "The email must be valid.",
    empty: "The email cannot be empty.",
    max: (max) => `The email must have a maximum of ${max} characters.`,
    required: "The email is required.",
  },
  password: {
    passwordMin:
      "The password must contain at least one uppercase letter and one special character.",
    min: (min) => `The password must have at least ${min} characters.`,
    max: (max) => `The password must have a maximum of ${max} characters.`,
    empty: "The password cannot be empty.",
    required: "The password is required.",
  },
  cpf: {
    empty: "The CPF cannot be empty.",
    length: (length) => `The CPF must have ${length} characters.`,
    number: "The CPF must contain only numbers.",
    required: "The CPF is required.",
  },
  phone_user: {
    empty: "The phone number cannot be empty.",
    length: (length) => `The phone number must have ${length} characters.`,
    number: "The phone number must contain only numbers.",
    required: "The phone number is required.",
  },
  gender_id: {
    number: "The gender ID must be an integer.",
    required: "The gender ID is required.",
  },
  education_id: {
    number: "The education ID must be an integer.",
    required: "The education ID is required.",
  },
  role_id: {
    number: "The role ID must be an integer.",
    required: "The role ID is required.",
  },
  address: {
    empty: "The address cannot be empty.",
    max: (max) => `The address must have a maximum of ${max} characters.`,
    required: "The address is required.",
  },
  city: {
    empty: "The city cannot be empty.",
    max: (max) => `The city must have a maximum of ${max} characters.`,
    required: "The city is required.",
  },
  state: {
    empty: "The state cannot be empty.",
    max: (max) => `The state must have a maximum of ${max} characters.`,
    required: "The state is required.",
  },
  cep: {
    empty: "The CEP cannot be empty.",
    length: (length) => `The CEP must have ${length} characters.`,
    number: "The CEP must contain only numbers.",
    required: "The CEP is required.",
  },
  birth_date: {
    invalid: "The birth date must be valid.",
    required: "The birth date is required.",
  },
  status: {
    only: "Status should be 0 or 1.",
  },
});

module.exports = messageErrorUser;
