const Joi = require('joi');
const errorMessagePayment = require('./errorMessagePayment');

const paymentValidation = Joi.object({
  company_id: Joi.number()
   .integer()
   .positive()
   .required()
   .messages({
     'number.integer': errorMessagePayment().company_id.invalid,
     'number.positive': errorMessagePayment().company_id.required,
     'any.required': errorMessagePayment().company_id.required,
   }),
  package_id: Joi.number()
   .integer()
   .positive()
   .required()
   .messages({
     'number.integer': errorMessagePayment().package_id.invalid,
     'number.positive': errorMessagePayment().package_id.required,
     'any.required': errorMessagePayment().package_id.required,
   }),
   payment_method: Joi.string()
   .required()
   .messages({
     'any.required': errorMessagePayment().payment_method.required,
   }),
});

module.exports = paymentValidation;