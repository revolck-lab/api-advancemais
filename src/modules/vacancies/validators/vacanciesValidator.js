const Joi = require("joi");
const errorMessageVacancy = require("./errorMessageVacancies");

const vacancyValidation = Joi.object({
  title: Joi.string()
    .max(100)
    .required()
    .messages({
      "string.empty": errorMessageVacancy().title.empty,
      "string.max": errorMessageVacancy().title.max(100),
      "any.required": errorMessageVacancy().title.required,
    }),
  requirements: Joi.string().required().messages({
    "string.empty": errorMessageVacancy().requirements.empty,
    "any.required": errorMessageVacancy().requirements.required,
  }),
  activities: Joi.string().required().messages({
    "string.empty": errorMessageVacancy().activities.empty,
    "any.required": errorMessageVacancy().activities.required,
  }),
  start_date: Joi.date().iso().required().messages({
    "date.base": errorMessageVacancy().start_date.base,
    "any.required": errorMessageVacancy().start_date.required,
  }),
  end_date: Joi.date()
    .iso()
    .greater(Joi.ref("start_date"))
    .required()
    .messages({
      "date.base": errorMessageVacancy().end_date.base,
      "date.greater": errorMessageVacancy().end_date.greater,
      "any.required": errorMessageVacancy().end_date.required,
    }),
  company_id: Joi.number().required().messages({
    "number.base": errorMessageVacancy().company_id.base,
    "any.required": errorMessageVacancy().company_id.required,
  }),
  area_id: Joi.number().required().messages({
    "number.base": errorMessageVacancy().area_id.base,
    "any.required": errorMessageVacancy().area_id.required,
  }),
  city: Joi.string()
    .max(100)
    .required()
    .messages({
      "string.empty": errorMessageVacancy().city.empty,
      "string.max": errorMessageVacancy().city.max(100),
      "any.required": errorMessageVacancy().city.required,
    }),
  state_id: Joi.number().required().messages({
    "number.base": errorMessageVacancy().state_id.base,
    "any.required": errorMessageVacancy().state_id.required,
  }),
});

module.exports = vacancyValidation;
