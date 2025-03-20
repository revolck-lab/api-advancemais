const messageErrorCarouselCompany = () => ({
  url: {
      empty: 'The image URL cannot be empty.',
      invalid: 'The image URL must be a valid URI.',
      max: 'The image URL cannot exceed {#limit} characters.',
      required: 'The image URL is required.',
  },
  title: {
      empty: 'The title cannot be empty.',
      max: 'The title cannot exceed {#limit} characters.',
      required: 'The title is required.',
  },
  description: {
      empty: 'The description cannot be empty.',
      max: 'The description cannot exceed {#limit} characters.',
      required: 'The description is required.',
  },
  link: {
      empty: 'The link cannot be empty.',
      invalid: 'The link must be a valid URI.',
      max: 'The link cannot exceed {#limit} characters.',
  },
});

module.exports = messageErrorCarouselCompany;
