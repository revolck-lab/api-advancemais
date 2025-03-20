const errorMessageCourse = () => ({
  title: {
      empty: 'The title field cannot be empty.',
      max: (max) => `The title must have at most ${max} characters.`,
      required: 'The title field is required.',
  },
  description: {
      empty: 'The description field cannot be empty.',
      required: 'The description field is required.',
  },
  category_id: {
      base: 'The category ID must be a valid number.',
      required: 'The category ID field is required.',
  },
  instructor_id: {
      base: 'The instructor ID must be a valid number.',
      required: 'The instructor ID field is required.',
  },
  modality_id: {
      base: 'The modality ID must be a valid number.',
      required: 'The modality ID field is required.',
  },
  workload: {
      base: 'The workload must be a valid number.',
      positive: 'The workload must be a positive number.',
      required: 'The workload field is required.',
  },
  vacancies: {
      base: 'The vacancies must be a valid number.',
      positive: 'The vacancies must be a positive number.',
      required: 'The vacancies field is required.',
  },
  price: {
      base: 'The price must be a valid number.',
      positive: 'The price must be a positive number.',
      required: 'The price field is required.',
  },
  start_time: {
      base: 'The start time must be a valid date.',
      required: 'The start time field is required.',
  },
  end_time: {
      base: 'The end time must be a valid date.',
      greater: 'The end time must be later than the start time.',
      required: 'The end time field is required.',
  },
  course_image: {
      url: 'The course image URL must be a valid URI.',
      required: 'The course image is required.',
      title: 'The course image title must be a string.',
      description: 'The course image description must be a string.',
  },
  course_thumbnail: {
      thumbnail_url: 'The thumbnail URL must be a valid URI.',
      required: 'The course thumbnail is required.',
      title: 'The course thumbnail title must be a string.',
      description: 'The course thumbnail description must be a string.',
  },
});

module.exports = errorMessageCourse;
