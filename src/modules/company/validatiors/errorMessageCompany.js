const messageErrorCompany = () => ({
  cnpj: {
    empty: "The CNPJ cannot be empty.",
    length: "The CNPJ must have exactly 14 digits.",
    invalid: "The CNPJ must contain only numbers.",
    required: "The CNPJ is required.",
  },
  trade_name: {
    empty: "The trade name cannot be empty.",
    max: (max) => `The trade name must have a maximum of ${max} characters.`,
    required: "The trade name is required.",
  },
  business_name: {
    empty: "The business name cannot be empty.",
    max: (max) => `The business name must have a maximum of ${max} characters.`,
    required: "The business name is required.",
  },
  contact_name: {
    empty: "The contact name cannot be empty.",
    max: (max) => `The contact name must have a maximum of ${max} characters.`,
    required: "The contact name is required.",
  },
  address: {
    empty: "The address cannot be empty.",
    max: (max) => `The address must have a maximum of ${max} characters.`,
    required: "The address is required.",
  },
  number: {
    empty: "The number cannot be empty.",
    max: (max) => `The number must have a maximum of ${max} characters.`,
    required: "The number is required.",
  },
  city: {
    empty: "The city cannot be empty.",
    max: (max) => `The city must have a maximum of ${max} characters.`,
    required: "The city is required.",
  },
  state_id: {
    invalid: "The state ID must be a valid number.",
    required: "The state ID is required.",
  },
  cep: {
    empty: "The CEP cannot be empty.",
    length: "The CEP must have exactly 8 digits.",
    invalid: "The CEP must contain only numbers.",
    required: "The CEP is required.",
  },
  whatsapp: {
    max: (max) => `The WhatsApp number must have a maximum of ${max} characters.`,
  },
  mobile_phone: {
    max: (max) => `The mobile phone number must have a maximum of ${max} characters.`,
  },
  landline_phone: {
    max: (max) => `The landline phone number must have a maximum of ${max} characters.`,
  },
  email: {
    empty: "The email cannot be empty.",
    invalid: "The email must be a valid email address.",
    max: (max) => `The email must have a maximum of ${max} characters.`,
    required: "The email is required.",
  },
  password: {
    empty: "The password cannot be empty.",
    min: (min) => `The password must have at least ${min} characters.`,
    max: (max) => `The password must have a maximum of ${max} characters.`,
    required: "The password is required.",
  },
  role_id: {
    invalid: "The role ID must be a valid number.",
    required: "The role ID is required.",
  },
});

module.exports = messageErrorCompany;