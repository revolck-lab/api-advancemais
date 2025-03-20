const Joi = require("joi");
const errorMessagesBudget = require('./errorMessageBudget');

const budgetValidation = Joi.object({
  service_id: Joi.number().integer().required().messages({
    "any.required": errorMessagesBudget().service_id.required,
    "number.base": errorMessagesBudget().service_id.invalid,
  }),

  first_name: Joi.string().min(3).max(100).required().messages({
    "any.required": errorMessagesBudget().first_name.required,
    "string.empty": errorMessagesBudget().first_name.empty,
    "string.min": errorMessagesBudget().first_name.min,
    "string.max": errorMessagesBudget().first_name.max,
  }),

  last_name: Joi.string().min(3).max(100).required().messages({
    "any.required": errorMessagesBudget().last_name.required,
    "string.empty": errorMessagesBudget().last_name.empty,
    "string.min": errorMessagesBudget().last_name.min,
    "string.max": errorMessagesBudget().last_name.max,
  }),

  company_name: Joi.string().min(2).max(100).required().messages({
    "any.required": errorMessagesBudget().company_name.required,
    "string.empty": errorMessagesBudget().company_name.empty,
    "string.min": errorMessagesBudget().company_name.min,
    "string.max": errorMessagesBudget().company_name.max,
  }),

  position: Joi.string().min(2).max(100).required().messages({
    "any.required": errorMessagesBudget().position.required,
    "string.empty": errorMessagesBudget().position.empty,
    "string.min": errorMessagesBudget().position.min,
    "string.max": errorMessagesBudget().position.max,
  }),

  email: Joi.string().email().required().messages({
    "any.required": errorMessagesBudget().email.required,
    "string.email": errorMessagesBudget().email.invalid,
  }),

  address: Joi.string().optional().max(255).messages({
    "string.max": errorMessagesBudget().address.max,
  }),

  state_id: Joi.number().integer().required().messages({
    "any.required": errorMessagesBudget().state_id.required,
    "number.base": errorMessagesBudget().state_id.invalid,
  }),

  phone: Joi.string()
    .pattern(/^\+?[0-9]{10,15}$/)
    .required()
    .messages({
      "any.required": errorMessagesBudget().phone.required,
      "string.pattern.base": errorMessagesBudget().phone.invalid,
    }),

  city: Joi.string().required().messages({
    "any.required": errorMessagesBudget().city.required,
  }),

  postal_code: Joi.string()
    .pattern(/^\d{5}-?\d{3}$/)
    .optional()
    .messages({
      "string.pattern.base": errorMessagesBudget().postal_code.invalid,
    }),
});

module.exports = budgetValidation;
