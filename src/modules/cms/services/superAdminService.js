const superAdminModel = require('../models/superAdminModel');

const superAdminService = {
  createSmtpServerService: async (smtpServer) => {
    const id = await superAdminModel.createSmtpServer(smtpServer);
    return id;
  },
  updateSmtpServerService: async (id, smtpServer) => {
    await superAdminModel.updateSmtpServer(id, smtpServer);
  },
  getSmtpServerService: async (id) => {
    const smtpServer = await superAdminModel.getSmtpServer(id);
    return smtpServer;
  },
  // informações do site
  createSiteInformationService: async (siteInformation) => {
    const id = await superAdminModel.createSiteInformation(siteInformation);
    return id;
  },
  updateSiteInformationService: async (id, siteInformation) => {
    await superAdminModel.updateSiteInformation(id, siteInformation);
  },
  getSiteInformationService: async (id) => {
    const siteInformation = await superAdminModel.getSiteInformation(id);
    return siteInformation;
  },
}

module.exports = superAdminService;