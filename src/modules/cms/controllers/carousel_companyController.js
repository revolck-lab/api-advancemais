const carouselCompanyService = require("../services/carouselCompanyService");
const carouselCompanyValidation = require('../validatiors/carouselCompanyValidation');

const carouselCompanyController = {
  getAllCarouselCompany: async (req, res) => {
    try {
      const carouselCompanies =
        await carouselCompanyService.getAllCarouselCompany();
      res.status(200).json(carouselCompanies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  createCarouselCompany: async (req, res) => {
    try {
      const { error } = carouselCompanyValidation.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      const carouselCompany = req.body;
      const id = await carouselCompanyService.createCarouselCompany(
        carouselCompany
      );
      res
        .status(201)
        .json({ id, message: "Carousel company created successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  updateCarouselCompany: async (req, res) => {
    try {
      const { id } = req.params;
      const carouselCompany = req.body;
      await carouselCompanyService.updateCarouselCompany(id, carouselCompany);
      res
        .status(200)
        .json({ message: "Carousel company updated successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  deleteCarouselCompany: async (req, res) => {
    try {
      const { id } = req.params;
      await carouselCompanyService.deleteCarouselCompany(id);
      res
        .status(200)
        .json({ message: "Carousel company deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  findByIdCompany: async (req, res) => {
    try {
      const { id } = req.params;
      const carouselCompany = await carouselCompanyService.findByIdCompany(id);
      if (!carouselCompany) {
        return res.status(404).json({ message: "Carousel company not found" });
      }
      res.status(200).json(carouselCompany);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = carouselCompanyController;
