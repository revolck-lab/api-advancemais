const { knexInstance } = require('../../../config/db');

const superAdminModel = {
  getSmtpServer: async (id) => {
    const db = await knexInstance();
    return db('smtp').where({ id }).first();
  },
  createSmtpServer: async (smtpServer) => {
    const db = await knexInstance();
    const [id] = await db('smtp').insert(smtpServer);
    return id;
  },
  updateSmtpServer: async (id, smtpServer) => {
    const db = await knexInstance();
    return db('smtp')
     .where({ id })
     .update(smtpServer);
  },
  //informações do site
  getSiteInformation: async (id) => {
    const db = await knexInstance();
    return db('site_info').where({ id }).first();
  },
  createSiteInformation: async (siteInformation) => {
    const db = await knexInstance();
    const [id] = await db('site_info').insert(siteInformation);
    return id;
  },
  updateSiteInformation: async (id, siteInformation) => {
    const db = await knexInstance();
    return db('site_info')
     .where({ id })
     .update(siteInformation);
  },
};

module.exports = superAdminModel;