const messageErrorCarousel = () => ({
  url: {
    empty: 'The URL cannot be empty.',
    invalid: 'The URL must be a valid URI.',
    max: 'The URL cannot exceed 255 characters.',
    required: 'The URL is required.',
  },
  title: {
    empty: 'The title cannot be empty.',
    max: 'The title cannot exceed 255 characters.',
    required: 'The title is required.',
  },
  description: {
    empty: 'The description cannot be empty.',
    max: 'The description cannot exceed 100 characters.',
  },
});

module.exports = messageErrorCarousel;
