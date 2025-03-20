const { knexInstance } = require('../../../config/db');

const business_informationModel = {
  getAllBusinessInformation: async () => {
    const db = await knexInstance();
    return db('business_info').select('*');
  },
  updateBusinessInformation: async (id, businessInformation) => {
    const db = await knexInstance();
    return db('business_info').where({ id }).update(businessInformation);
  },
  createBusinessInformation: async (businessInformation) => {
    const db = await knexInstance();
    const [id] = await db('business_info').insert(businessInformation);
    return id;
  },
  deleteBusinessInformation: async (id) => {
    const db = await knexInstance();
    await db('business_info').where({ id }).del();
  },
  getBusinessInformationById: async (id) => {
    const db = await knexInstance();
    return db('business_info').where({ id }).first();
  },
}

module.exports = business_informationModel;