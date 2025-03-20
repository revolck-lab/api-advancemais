const Joi = require('joi');
const messageErrorCarouselCompany = require('./errorMessageCarouselCompany');

const carouselCompanyValidation = Joi.object({
    url: Joi.string()
    .uri()
    .max(255)
    .required()
    .messages({
      'string.empty': messageErrorCarouselCompany().url.empty,
      'string.uri': messageErrorCarouselCompany().url.invalid,
      'string.max': messageErrorCarouselCompany().url.max,
      'any.required': messageErrorCarouselCompany().url.required,
    }),
  title: Joi.string()
    .max(255)
    .required()
    .messages({
      'string.empty': messageErrorCarouselCompany().title.empty,
      'string.max': messageErrorCarouselCompany().title.max,
      'any.required': messageErrorCarouselCompany().title.required,
    }),
  description: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.empty': messageErrorCarouselCompany().description.empty,
      'string.max': messageErrorCarouselCompany().description.max,
    }),
});

module.exports = carouselCompanyValidation;
