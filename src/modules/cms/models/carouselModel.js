const { knexInstance } = require("../../../config/db");

const carouselModel = {
  getAllCarousel: async () => {
    const db = await knexInstance();
    return db("carousel");
  },
  createCarousel: async (carousel) => {
    const db = await knexInstance();
    const [id] = await db("carousel").insert(carousel);
    return id;
  },
  updateCarousel: async (id, carousel) => {
    const db = await knexInstance();
    return db("carousel").where({ id }).update(carousel);
  },
  deleteCarousel: async (id) => {
    const db = await knexInstance();
    return db("carousel").where({ id }).del();
  },
  findByIdCarousel: async (id) => {
    const db = await knexInstance();
    return db("carousel").where({ id }).first();
  },
};

module.exports = carouselModel;
