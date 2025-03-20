const carouselService = require("../services/carouselService");

const carouselController = {
  getAll: async (req, res) => {
    try {
      const carousels = await carouselService.getAll();
      res.json(carousels);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  create: async (req, res) => {
    try {
      const carousel = req.body;
      const id = await carouselService.create(carousel);
      res.status(201).json({ id });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const carousel = req.body;
      await carouselService.update(id, carousel);
      res.json({ message: "Carousel updated successfully" });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      await carouselService.delete(id);
      res.json({ message: "Carousel deleted successfully" });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const carousel = await carouselService.findById(id);
      res.json(carousel);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },
};

module.exports = carouselController;
