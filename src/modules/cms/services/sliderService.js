const sliderModel = require('../models/sliderModel');

const sliderService = {
  getAllSliders: async () => {
    const sliders = await sliderModel.getAllSliders();
    return sliders;
  },
  getSliderDetails: async (id) => {
    const slider = await sliderModel.getSliderById(id);
    if (!slider) {
      throw new Error('Slider not found');
    }
    return slider;
  },
  createSlider: async (slider) => {
    const id = await sliderModel.createSlider(slider);
    return id;
  },
  updateSlider: async (id, slider) => {
    await sliderModel.updateSlider(id, slider);
  },
  deleteSlider: async (id) => {
    await sliderModel.deleteSlider(id);
    return true;
  }
}

module.exports = sliderService;