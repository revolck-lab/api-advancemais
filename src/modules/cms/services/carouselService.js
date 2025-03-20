const carouselModel = require('../models/carouselModel');

const carouselService = {
  getAll: async () => {
    return await carouselModel.getAllCarousel();
  },
  create: async (carousel) => {
    return await carouselModel.createCarousel(carousel);
  },
  update: async (id, carousel) => {
    const existingCarousel = await carouselModel.findByIdCarousel(id);
    if (!existingCarousel) {
      throw new Error('Carousel not found');
    }
    return await carouselModel.updateCarousel(id, carousel);
  },
  delete: async (id) => {
    const existingCarousel = await carouselModel.findByIdCarousel(id);
    if (!existingCarousel) {
      throw new Error('Carousel not found');
    }
    return await carouselModel.deleteCarousel(id);
  },
  findById: async (id) => {
    const carousel = await carouselModel.findByIdCarousel(id);
    if (!carousel) {
      throw new Error('Carousel not found');
    }
    return carousel;
  },
};

module.exports = carouselService;
