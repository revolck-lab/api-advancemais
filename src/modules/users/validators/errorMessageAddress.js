const messageErrorAddress = (field) => {
  const messages = {
    address: {
      empty: "The address is required.",
      max: (max) => `The address must be at most ${max} characters.`,
      min: (min) => `The address must be at least ${min} characters.`,
      required: "The address is required.",
    },
    city: {
      empty: "The city is required.",
      max: (max) => `The city must be at most ${max} characters.`,
      min: (min) => `The city must be at least ${min} characters.`,
      required: "The city is required.",
    },
    state: {
      empty: "The state is required.",
      max: (max) => `The state must be at most ${max} characters.`,
      min: (min) => `The state must be at least ${min} characters.`,
      required: "The state is required.",
    },
    cep: {
      empty: "The CEP is required.",
      length: (len) => `The CEP must have exactly ${len} digits.`,
      invalid: "The CEP must contain only numbers and be 8 digits long.",
      required: "The CEP is required.",
    },
  };

  return messages[field];
};

module.exports = messageErrorAddress;
