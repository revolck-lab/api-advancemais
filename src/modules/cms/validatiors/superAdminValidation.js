const joi = require('joi');
const messageErrorSuperAdmin = require('./errorMessageSuperAdmin');

const superAdminValidation = joi.object({
  smtp_host: joi.string().required().messages({
    'string.empty': messageErrorSuperAdmin().smtp_host.empty,
    'any.required': messageErrorSuperAdmin().smtp_host.required,
  }),
  smtp_port: joi.number().integer().min(1).max(65535).required().messages({
    'number.base': messageErrorSuperAdmin().smtp_port.invalid,
    'number.min': messageErrorSuperAdmin().smtp_port.min,
    'number.max': messageErrorSuperAdmin().smtp_port.max,
    'any.required': messageErrorSuperAdmin().smtp_port.required,
  }),
  smtp_username: joi.string().required().messages({
    'string.empty': messageErrorSuperAdmin().smtp_username.empty,
    'any.required': messageErrorSuperAdmin().smtp_username.required,
  }),
  smtp_password: joi.string().required().messages({
    'string.empty': messageErrorSuperAdmin().smtp_password.empty,
    'any.required': messageErrorSuperAdmin().smtp_password.required,
  })
});

module.exports = superAdminValidation;