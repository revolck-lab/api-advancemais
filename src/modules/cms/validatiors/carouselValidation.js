const Joi = require('joi');
const messageErrorCarousel = require('./errorMessageCarousel');

const carouselValidation = Joi.object({
  url: Joi.string()
    .uri()
    .max(255)
    .required()
    .messages({
      'string.empty': messageErrorCarousel().url.empty,
      'string.uri': messageErrorCarousel().url.invalid,
      'string.max': messageErrorCarousel().url.max,
      'any.required': messageErrorCarousel().url.required,
    }),
  title: Joi.string()
    .max(255)
    .required()
    .messages({
      'string.empty': messageErrorCarousel().title.empty,
      'string.max': messageErrorCarousel().title.max,
      'any.required': messageErrorCarousel().title.required,
    }),
  description: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.empty': messageErrorCarousel().description.empty,
      'string.max': messageErrorCarousel().description.max,
    }),
});

module.exports = carouselValidation;
