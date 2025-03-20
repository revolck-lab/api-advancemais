const { knexInstance } = require("../../../config/db");

const bannerModel = {
  getAllBanners: async () => {
    const db = await knexInstance();
    return db("banner").select("*");
  },
  createBanner: async (banner) => {
    const db = await knexInstance();
    const [id] = await db("banner").insert(banner);
    return id;
  },
  updateBanner: async (id, banner) => {
    const db = await knexInstance();
    return db("banner").where({ id }).update(banner);
  },
  deleteBanner: async (id) => {
    const db = await knexInstance();
    return db("banner").where({ id }).del();
  },
  getBannerById: async (id) => {
    const db = await knexInstance();
    return db("banner").where({ id }).first();
  },
};

module.exports = bannerModel;
