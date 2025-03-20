const errorMessageVacancy = () => ({
  title: {
    empty: "The title field cannot be empty.",
    max: (max) => `The title must have at most ${max} characters.`,
    required: "The title field is required.",
  },
  requirements: {
    empty: "The requirements field cannot be empty.",
    required: "The requirements field is required.",
  },
  activities: {
    empty: "The activities field cannot be empty.",
    required: "The activities field is required.",
  },
  start_date: {
    base: "The start date must be a valid date.",
    required: "The start date is required.",
  },
  end_date: {
    base: "The end date must be a valid date.",
    greater: "The end date must be later than the start date.",
    required: "The end date is required.",
  },
  company_id: {
    base: "The company ID must be a valid number.",
    required: "The company ID is required.",
  },
  area_id: {
    base: "The area ID must be a valid number.",
    required: "The area ID is required.",
  },
  city: {
    empty: "The city field cannot be empty.",
    max: (max) => `The city must have at most ${max} characters.`,
    required: "The city field is required.",
  },
  state_id: {
    base: "The state ID must be a valid number.",
    required: "The state ID is required.",
  },
});

module.exports = errorMessageVacancy;
