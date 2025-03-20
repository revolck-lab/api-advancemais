const messageErrorBanner = () => ({
  url: {
    invalid: "The banner URL must be a valid URI.",
    empty: "The banner URL cannot be empty.",
    max: (max) => `The banner URL must have a maximum of ${max} characters.`,
    required: "The banner URL is required.",
  },
  title: {
    empty: "The title cannot be empty.",
    max: (max) => `The title must have a maximum of ${max} characters.`,
    required: "The title is required.",
  },
  description: {
    empty: "The description cannot be empty.",
    max: (max) => `The description must have a maximum of ${max} characters.`,
    required: "The description is required.",
  },
});

module.exports = messageErrorBanner;
