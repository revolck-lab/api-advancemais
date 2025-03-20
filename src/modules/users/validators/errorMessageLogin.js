const messageErrorLogin = () => ({
  login: {
    invalid: "Login must contain only numbers.",
    empty: "The login field cannot be empty.",
    min: (min) => `Login must have at least ${min} characters.`,
    max: (max) => `Login must have at most ${max} characters.`,
    required: "The login field is required.",
  },
  password: {
    empty: "Password is required.",
    min: (min) => `Password must be at least ${min} characters long.`,
    max: (max) => `Password cannot exceed ${max} characters.`,
    required: "Password is a required field.",
    pattern: "Password does not meet the required format.",
  },
});

module.exports = messageErrorLogin;
