const Joi = require("joi");
const messageErrorLogin = require("./errorMessageLogin");

const loginValidation = Joi.object({
  login: Joi.string()
    .pattern(/^\d+$/)
    .min(11)
    .max(14)
    .required()
    .messages({
      "string.pattern.base": messageErrorLogin().login.invalid,
      "string.empty": messageErrorLogin().login.empty,
      "string.min": messageErrorLogin().login.min(11),
      "string.max": messageErrorLogin().login.max(14),
      "any.required": messageErrorLogin().login.required,
    }),
  password: Joi.string()
    .max(255)
    .min(8)
    .required()
    .messages({
      "string.empty": messageErrorLogin().password.empty,
      "string.min": messageErrorLogin().password.min(8),
      "string.max": messageErrorLogin().password.max(255),
      "any.required": messageErrorLogin().password.required,
      "string.pattern.base": messageErrorLogin().password.pattern,
    }),
});

module.exports = loginValidation;
