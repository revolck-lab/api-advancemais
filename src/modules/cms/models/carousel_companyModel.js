const { knexInstance } = require("../../../config/db");

const carouselCompanyModel = {
  getAllCarouselCompany: async () => {
    const db = await knexInstance();
    return db("carousel_company");
  },
  createCarouselCompany: async (carouselCompany) => {
    const db = await knexInstance();
    const [id] = await db("carousel_company").insert(carouselCompany);
    return id;
  },
  updateCarouselCompany: async (id, carouselCompany) => {
    const db = await knexInstance();
    return db("carousel_company").where({ id }).update(carouselCompany);
  },
  deleteCarouselCompany: async (id) => {
    const db = await knexInstance();
    return db("carousel_company").where({ id }).del();
  },
  findByIdCompany: async (id) => {
    const db = await knexInstance();
    return db("carousel_company").where({ id }).first();
  },
};

module.exports = carouselCompanyModel;
