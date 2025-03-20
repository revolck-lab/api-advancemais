const carouselCompanyModel = require('../models/carousel_companyModel');

const carouselCompanyService = {
  getAllCarouselCompany: async () => {
    return await carouselCompanyModel.getAllCarouselCompany();
  },

  createCarouselCompany: async (carouselCompany) => {
    if (!carouselCompany || Object.keys(carouselCompany).length === 0) {
      throw new Error('Invalid data for creating a carousel company');
    }
    return await carouselCompanyModel.createCarouselCompany(carouselCompany);
  },

  updateCarouselCompany: async (id, carouselCompany) => {
    if (!id || !carouselCompany || Object.keys(carouselCompany).length === 0) {
      throw new Error('Invalid data for updating a carousel company');
    }
    return await carouselCompanyModel.updateCarouselCompany(id, carouselCompany);
  },

  deleteCarouselCompany: async (id) => {
    if (!id) {
      throw new Error('Invalid ID for deleting a carousel company');
    }
    return await carouselCompanyModel.deleteCarouselCompany(id);
  },

  findByIdCompany: async (id) => {
    if (!id) {
      throw new Error('Invalid ID for finding a carousel company');
    }
    return await carouselCompanyModel.findByIdCompany(id);
  },
};

module.exports = carouselCompanyService;
