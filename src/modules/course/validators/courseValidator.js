const Joi = require("joi");
const errorMessageCourse = require("./errorMessageCourse");

const courseValidator = Joi.object({
  title: Joi.string()
    .max(255)
    .required()
    .messages({
      "string.empty": errorMessageCourse().title.empty,
      "string.max": errorMessageCourse().title.max(255),
      "any.required": errorMessageCourse().title.required,
    }),
  description: Joi.string().required().messages({
    "string.empty": errorMessageCourse().description.empty,
    "any.required": errorMessageCourse().description.required,
  }),
  category_id: Joi.number().integer().required().messages({
    "number.base": errorMessageCourse().category_id.base,
    "any.required": errorMessageCourse().category_id.required,
  }),
  instructor_id: Joi.number().integer().required().messages({
    "number.base": errorMessageCourse().instructor_id.base,
    "any.required": errorMessageCourse().instructor_id.required,
  }),
  modality_id: Joi.number().integer().required().messages({
    "number.base": errorMessageCourse().modality_id.base,
    "any.required": errorMessageCourse().modality_id.required,
  }),
  workload: Joi.number().integer().positive().required().messages({
    "number.base": errorMessageCourse().workload.base,
    "number.positive": errorMessageCourse().workload.positive,
    "any.required": errorMessageCourse().workload.required,
  }),
  vacancies: Joi.number().integer().positive().required().messages({
    "number.base": errorMessageCourse().vacancies.base,
    "number.positive": errorMessageCourse().vacancies.positive,
    "any.required": errorMessageCourse().vacancies.required,
  }),
  price: Joi.number().positive().required().messages({
    "number.base": errorMessageCourse().price.base,
    "number.positive": errorMessageCourse().price.positive,
    "any.required": errorMessageCourse().price.required,
  }),
  start_time: Joi.date().iso().required().messages({
    "date.base": errorMessageCourse().start_time.base,
    "any.required": errorMessageCourse().start_time.required,
  }),
  end_time: Joi.date()
    .iso()
    .greater(Joi.ref("start_time"))
    .required()
    .messages({
      "date.base": errorMessageCourse().end_time.base,
      "date.greater": errorMessageCourse().end_time.greater,
      "any.required": errorMessageCourse().end_time.required,
    }),
  course_image: Joi.object({
    url: Joi.string().uri().required().messages({
      "string.uri": errorMessageCourse().course_image.url,
      "any.required": errorMessageCourse().course_image.required,
    }),
    title: Joi.string().optional().messages({
      "string.base": errorMessageCourse().course_image.title,
    }),
    description: Joi.string().optional().messages({
      "string.base": errorMessageCourse().course_image.description,
    }),
  }).required(),
  course_thumbnail: Joi.object({
    thumbnail_url: Joi.string().uri().required().messages({
      "string.uri": errorMessageCourse().course_thumbnail.thumbnail_url,
      "any.required": errorMessageCourse().course_thumbnail.required,
    }),
    title: Joi.string().optional().messages({
      "string.base": errorMessageCourse().course_thumbnail.title,
    }),
    description: Joi.string().optional().messages({
      "string.base": errorMessageCourse().course_thumbnail.description,
    }),
  }).required(),
});

module.exports = courseValidator;
