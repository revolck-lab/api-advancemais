const joi = require('joi');
const messageErrorSlider = require('./errorMessageSlider');

const sliderValidation = joi.object({
  image_url: joi.string()
  .uri()
  .max(255)
  .required()
  .messages({
    'string.empty': messageErrorSlider().image_url.empty,
    'string.uri': messageErrorSlider().image_url.invalid,
    'string.max': messageErrorSlider().image_url.max,
    'any.required': messageErrorSlider().image_url.required,
  }),
  title: joi.string()
  .max(255)
  .required()
  .messages({
    'string.empty': messageErrorSlider().title.empty,
    'string.max': messageErrorSlider().title.max,
    'any.required': messageErrorSlider().title.required,
  }),
});

module.exports = sliderValidation;

