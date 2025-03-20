const Joi = require("joi");
const messageErrorBanner = require("./errorMessageBanner");

const bannerValidation = Joi.object({
  url: Joi.string()
    .uri()
    .max(255)
    .required()
    .messages({
      "string.empty": messageErrorBanner().url.empty,
      "string.uri": messageErrorBanner().url.invalid,
      "string.max": messageErrorBanner().url.max(255),
      "any.required": messageErrorBanner().url.required,
    }),
  title: Joi.string()
    .max(255)
    .required()
    .messages({
      "string.empty": messageErrorBanner().title.empty,
      "string.max": messageErrorBanner().title.max(255),
      "any.required": messageErrorBanner().title.required,
    }),
  description: Joi.string()
    .max(255)
    .required()
    .messages({
      "string.empty": messageErrorBanner().description.empty,
      "string.max": messageErrorBanner().description.max(255),
      "any.required": messageErrorBanner().description.required,
    }),
});

module.exports = bannerValidation;
