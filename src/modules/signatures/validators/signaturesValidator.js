const Joi = require('joi');
const errorMessagePackage = require('./errorMessagePackage');
const errorMessageSignature = require('./errorMessageSignature');

const packageValidation = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    'any.required': errorMessagePackage().name.required,
    'string.empty': errorMessagePackage().name.empty,
    'string.min': errorMessagePackage().name.min,
    'string.max': errorMessagePackage().name.max,
  }),
  vacancy_limit: Joi.number().integer().required().messages({
    'any.required': errorMessagePackage().vacancy_limit.required,
    'number.base': errorMessagePackage().vacancy_limit.invalid,
  }),
  price: Joi.number().required().messages({
    'any.required': errorMessagePackage().price.required,
    'number.base': errorMessagePackage().price.invalid,
  }),
  periodicity: Joi.string().required().valid('daily', 'weekly','monthly').messages({
    'any.required': errorMessagePackage().periodicity.required,
    'string.empty': errorMessagePackage().periodicity.empty,
    'string.valid': errorMessagePackage().periodicity.invalid,
  }),
  featured: Joi.boolean().required().messages({
    'any.required': errorMessagePackage().featured.required,
    'boolean.base': errorMessagePackage().featured.invalid,
  }),
});

const signatureValidation = Joi.object({
  company_id: Joi.number().integer().required().messages({
    'any.required': errorMessageSignature().company_id.required,
    'number.base': errorMessageSignature().company_id.invalid,
  }),
  package_id: Joi.number().integer().required().messages({
    'any.required': errorMessageSignature().package_id.required,
    'number.base': errorMessageSignature().package_id.invalid,
  }),
  status: Joi.string().required().valid('active', 'canceled', 'expired').messages({
    'any.required': errorMessageSignature().status.required,
    'string.empty': errorMessageSignature().status.empty,
    'string.valid': errorMessageSignature().status.invalid,
  }),
});

module.exports = { 
  packageValidation,
  signatureValidation
}
