const Joi = require("joi");
const messageErrorAddress = require("./function_errorMessageAddress");

const addressValidation = Joi.object({
  address: Joi.string()
    .max(255)
    .min(1)
    .required()
    .messages({
      "string.empty": messageErrorAddress("address").empty,
      "string.max": messageErrorAddress("address").max(255),
      "string.min": messageErrorAddress("address").min(1),
      "any.required": messageErrorAddress("address").required,
    }),

  city: Joi.string()
    .max(100)
    .min(1)
    .required()
    .messages({
      "string.empty": messageErrorAddress("city").empty,
      "string.max": messageErrorAddress("city").max(100),
      "string.min": messageErrorAddress("city").min(1),
      "any.required": messageErrorAddress("city").required,
    }),

  state: Joi.string()
    .max(100)
    .min(1)
    .required()
    .messages({
      "string.empty": messageErrorAddress("state").empty,
      "string.max": messageErrorAddress("state").max(100),
      "string.min": messageErrorAddress("state").min(1),
      "any.required": messageErrorAddress("state").required,
    }),

  cep: Joi.string()
    .length(8)
    .pattern(/^[0-9]{8}$/)
    .required()
    .messages({
      "string.empty": messageErrorAddress("cep").empty,
      "string.length": messageErrorAddress("cep").length(8),
      "string.pattern.base": messageErrorAddress("cep").invalid,
      "any.required": messageErrorAddress("cep").required,
    }),
});

module.exports = addressValidation;
