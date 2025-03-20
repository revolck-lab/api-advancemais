const messageErrorSlider = () => ({
  image_url: {
    empty: 'The image URL cannot be empty.',
    invalid: 'The image URL must be a valid URI.',
    max: 'The image URL cannot exceed 255 characters.',
    required: 'The image URL is required.',
  },
  title: {
    empty: 'The title cannot be empty.',
    max: 'The title cannot exceed 255 characters.',
    required: 'The title is required.',
  },
});

module.exports = messageErrorSlider;