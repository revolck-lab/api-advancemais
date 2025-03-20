const Joi = require("joi");
const messageErrorCompany = require("../validatiors/errorMessageCompany");

const companyValidation = Joi.object({
  cnpj: Joi.string()
    .length(14)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.empty": messageErrorCompany().cnpj.empty,
      "string.length": messageErrorCompany().cnpj.length,
      "string.pattern.base": messageErrorCompany().cnpj.invalid,
      "any.required": messageErrorCompany().cnpj.required,
    }),
  trade_name: Joi.string()
    .max(255)
    .required()
    .messages({
      "string.empty": messageErrorCompany().trade_name.empty,
      "string.max": messageErrorCompany().trade_name.max(255),
      "any.required": messageErrorCompany().trade_name.required,
    }),
  business_name: Joi.string()
    .max(255)
    .required()
    .messages({
      "string.empty": messageErrorCompany().business_name.empty,
      "string.max": messageErrorCompany().business_name.max(255),
      "any.required": messageErrorCompany().business_name.required,
    }),
  contact_name: Joi.string()
    .max(255)
    .required()
    .messages({
      "string.empty": messageErrorCompany().contact_name.empty,
      "string.max": messageErrorCompany().contact_name.max(255),
      "any.required": messageErrorCompany().contact_name.required,
    }),
  address: Joi.string()
    .max(255)
    .required()
    .messages({
      "string.empty": messageErrorCompany().address.empty,
      "string.max": messageErrorCompany().address.max(255),
      "any.required": messageErrorCompany().address.required,
    }),
  number: Joi.string()
    .max(10)
    .required()
    .messages({
      "string.empty": messageErrorCompany().number.empty,
      "string.max": messageErrorCompany().number.max(10),
      "any.required": messageErrorCompany().number.required,
    }),
  city: Joi.string()
    .max(255)
    .required()
    .messages({
      "string.empty": messageErrorCompany().city.empty,
      "string.max": messageErrorCompany().city.max(255),
      "any.required": messageErrorCompany().city.required,
    }),
  state_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": messageErrorCompany().state_id.invalid,
      "any.required": messageErrorCompany().state_id.required,
    }),
  cep: Joi.string()
    .length(8)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.empty": messageErrorCompany().cep.empty,
      "string.length": messageErrorCompany().cep.length,
      "string.pattern.base": messageErrorCompany().cep.invalid,
      "any.required": messageErrorCompany().cep.required,
    }),
  whatsapp: Joi.string()
    .max(15)
    .allow(null, "")
    .messages({
      "string.max": messageErrorCompany().whatsapp.max(15),
    }),
  mobile_phone: Joi.string()
    .max(15)
    .allow(null, "")
    .messages({
      "string.max": messageErrorCompany().mobile_phone.max(15),
    }),
  landline_phone: Joi.string()
    .max(15)
    .allow(null, "")
    .messages({
      "string.max": messageErrorCompany().landline_phone.max(15),
    }),
  email: Joi.string()
    .email()
    .max(255)
    .required()
    .messages({
      "string.empty": messageErrorCompany().email.empty,
      "string.email": messageErrorCompany().email.invalid,
      "string.max": messageErrorCompany().email.max(255),
      "any.required": messageErrorCompany().email.required,
    }),
  password: Joi.string()
    .min(6)
    .max(255)
    .required()
    .messages({
      "string.empty": messageErrorCompany().password.empty,
      "string.min": messageErrorCompany().password.min(6),
      "string.max": messageErrorCompany().password.max(255),
      "any.required": messageErrorCompany().password.required,
    }),
  role_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": messageErrorCompany().role_id.invalid,
      "any.required": messageErrorCompany().role_id.required,
    }),
});

module.exports = companyValidation;