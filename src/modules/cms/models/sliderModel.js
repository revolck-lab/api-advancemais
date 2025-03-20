const { knexInstance } = require('../../../config/db');

const sliderModel = {
  getAllSliders: async () => {
    const db = await knexInstance();
    return db('slider').select('*');
  },
  getSliderById:async (id) => {
    const db = await knexInstance();
    return db('slider').where({ id }).first();
  },
  createSlider: async (slider) => {
    const db = await knexInstance();
    const [id] = await db('slider').insert(slider);
    return id;
  },
  updateSlider: async (id, slider) => {
    const db = await knexInstance();
    return db('slider')
     .where({ id })
     .update(slider);
  },
  deleteSlider: async (id) => {
    const db = await knexInstance();
    return db('slider').where({ id }).del();
  },
}

module.exports = sliderModel;