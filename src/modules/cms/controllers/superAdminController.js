const { resetTransporter, verifyConnection } = require('../../../services/emailServices');
const superAdminService = require('../services/superAdminService');
const smtpValidation = require('../validatiors/superAdminValidation');
const { upload, deleteFile } = require('../../../services/awsService');

const superAdmController = {
  CreateSmtp: async (req, res) => {
    try {
      const author_id = req.user.id;
      if (!author_id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { error } = smtpValidation.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { smtp_host, smtp_port, smtp_username, smtp_password } = req.body;

      const smtpServer = {
        smtp_host,
        smtp_port,
        smtp_username,
        smtp_password,
        author_id,
      };

      const id = await superAdminService.createSmtpServerService(smtpServer);

      await resetTransporter();
      await verifyConnection();

      return res.status(201).json({ id, message: 'SMTP server created successfully' });
    } catch (error) {
      console.error('Error in smtpServer:', error);
      return res.status(500).json({ error: error.message || 'Failed to create SMTP server' });
    }
  },

  updateSmtp: async (req, res) => {
    try {
      const author_id = req.user.id;
      if (!author_id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { error } = smtpValidation.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'SMTP server ID is required' });
      }

      const { smtp_host, smtp_port, smtp_username, smtp_password } = req.body;

      const smtpServer = {
        smtp_host,
        smtp_port,
        smtp_username,
        smtp_password,
        author_id,
      };

      await superAdminService.updateSmtpServerService(id, smtpServer);

      await resetTransporter();
      await verifyConnection();
      return res.status(200).json({ message: 'SMTP server updated successfully' });
    } catch (error) {
      console.error('Error in updateSmtpServer:', error);
      return res.status(500).json({ error: error.message || 'Failed to update SMTP server' });
    }
  },
  getSmtpServer: async (req, res) => {
    try {
      const author_id = req.user.id;
      if (!author_id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'SMTP server ID is required' });
      }

      const smtpServer = await superAdminService.getSmtpServerService(id);

      if (!smtpServer) {
        return res.status(404).json({ message: 'SMTP server not found' });
      }

      return res.status(200).json(smtpServer);
    } catch (error) {
      console.error('Error in getSmtpServer:', error);
      return res.status(500).json({ error: error.message || 'Failed to get SMTP server' });
    }
  },
  addSiteInformation: async (req, res) => {
    try {
      const { site_name } = req.body;
      const author_id = req.user.id;

      if (!req.file || !site_name) { // favicon é obrigatório pelo req.file
        return res.status(400).json({ message: 'Site name and favicon are required' });
      }

      const { buffer, mimetype, originalname } = req.file;
      const result = await upload(`path/to/site_information/${originalname}`, buffer, mimetype);

      const siteInformation = {
        site_name,
        favicon_url: result.url,
        author_id,
      };

      await superAdminService.createSiteInformationService(siteInformation);

      return res.status(201).json({ message: 'Site information created successfully' });
    } catch (error) {
      console.error('Error in siteInformations:', error);
      return res.status(500).json({ error: error.message || 'Failed to create site information' });
    }
  },

editSiteInformation: async (req, res) => {
    try {
      const { id } = req.params;
      const site = req.body;
      const author_id = req.user.id;

      if (!id) {
        return res.status(400).json({ message: 'Site information ID is required' });
      }

      if (!site.site_name && !req.file) {
        return res.status(400).json({ message: 'At least one of site name or favicon is required' });
      }

      const existingSiteInformation = await superAdminService.getSiteInformationService(id);
      if (!existingSiteInformation) {
        return res.status(404).json({ message: 'Site information not found' });
      }

      const siteInfo = {
        site_name: site.site_name || existingSiteInformation.site_name, // Mantém o nome atual se não enviado
        author_id,
        favicon_url: existingSiteInformation.favicon_url, // Mantém a URL atual do favicon
      };

      if (req.file) {
        const { buffer, mimetype, originalname } = req.file;
        const result = await upload(`path/to/site_information/${originalname}`, buffer, mimetype);
        siteInfo.favicon_url = result.url; // Atualiza a URL do favicon

        if (existingSiteInformation.favicon_url) {
          await deleteFile(existingSiteInformation.favicon_url); // Deleta a imagem antiga
        }
      }

      await superAdminService.updateSiteInformationService(id, siteInfo);
      return res.status(200).json({ message: 'Site information updated successfully' });
    } catch (error) {
      console.error('Error in updateSiteInformation:', error);
      return res.status(500).json({ error: error.message || 'Failed to update site information' });
    }
  },
  getSiteInformation: async (req, res) => {
    try {
      const siteInformation = await superAdminService.getSiteInformationService(req.params.id);

      if (!siteInformation) {
        return res.status(404).json({ message: 'Site information not found' });
      }

      return res.json(siteInformation);
    } catch (error) {
      console.error('Error in getSiteInformation:', error);
      return res.status(500).json({ message: 'Failed to retrieve site information' });
    }
  },
};

module.exports = superAdmController;