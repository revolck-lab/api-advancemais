const business_informationModel = require('../models/business_informationModel');

const business_informationService = {
  getAllBusinessInformation: async () => {
    const businessInformation = await business_informationModel.getAllBusinessInformation();
    return businessInformation;
  },
  updateBusinessInformation: async (id, businessInformation) => {
    await business_informationModel.updateBusinessInformation(id, businessInformation);
    return true;
  },
  createBusinessInformation: async (businessInformation) => {
    const id = await business_informationModel.createBusinessInformation(businessInformation);
    return id;
  },
  deleteBusinessInformation: async (id) => {
    await business_informationModel.deleteBusinessInformation(id);
    return true;
  },
  getBusinessInformationDetails: async (id) => {
    const businessInformation = await business_informationModel.getBusinessInformationById(id);
    if (!businessInformation) {
      throw new Error('Business Information not found');
    }
    return businessInformation;
  }
}

module.exports = business_informationService;