const bannerModel = require('../models/bannerModel');

const bannerService = {
    getAllBanners: async () => {
      const banners = await bannerModel.getAllBanners();
      return banners;
    },
    getBannerDetails: async (id) => {
      const banner = await bannerModel.findById(id);
      if (!banner) {
        throw new Error('Banner not found');
      }
      return banner;
    },
    createBanner: async (banner) => {
      const id = await bannerModel.createBanner(banner);
      return id;  
    },
    updateBanner: async (id, banner) => {
      await bannerModel.updateBanner(id, banner);
    },
    deleteBanner: async (id) => {
      await bannerModel.deleteBanner(id);
      return true;
    }
};

module.exports = bannerService;
