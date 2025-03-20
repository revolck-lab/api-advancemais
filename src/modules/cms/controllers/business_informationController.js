const business_informationService = require('../services/business_informationService');
const { upload, deleteFile } = require('../../../services/awsService');

const business_informationController = {
  listBusinessInformation: async (req, res) => {
    try {
      const businessInformation = await business_informationService.getAllBusinessInformation();
      if (!businessInformation.length) {
        return res.status(204).json({ message: 'No business information was returned' });
      }
      res.json(businessInformation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  addBusinessInformation: async (req, res) => {
    try {
      const { title, description } = req.body;
      const { id } = req.user;
    
      if (!req.file || !title ||!description) {
        return res.status(400).json({ message: 'Title, file and description are required' });
      }

      const { buffer, mimetype, originalname } = req.file;
      const result = await upload(`path/to/business_information/${originalname}`, buffer, mimetype);

      const businessInformation = {
        title,
        description,
        image_url: result.url,
        author_id: id,
      };

      const createBusinessInformation = await business_informationService.createBusinessInformation(businessInformation);

      res.status(201).json({ message: 'Business information created successfully', createBusinessInformation });  
    } catch (error) {
      console.log('Error creating business information', error);
      res.status(500).json({ error: error.message });
    }
  },
  editBusinessInformation: async (req, res) => {
    try {
      const { id } = req.params;
      const businessInformation = req.body;
      const user_id = req.user.id;

      if (!businessInformation.title &&!businessInformation.description &&!req.file) {
        return res.status(400).json({ message: 'Title, description and/or image are required' });
      }

      const existingBusinessInformation = await business_informationService.getBusinessInformationDetails(id);
      if (!existingBusinessInformation) {
        return res.status(404).json({ message: 'Business information not found' });
      }

      const updatedBusinessInformation = {
        title: businessInformation.title,
        description: businessInformation.description,
        author_id: user_id,
      };

      if (req.file) {
        const { buffer, mimetype, originalname } = req.file;
        const result = await upload(`path/to/business_information/${originalname}`, buffer, mimetype);
        updatedBusinessInformation.image_url = result.url;

        if (existingBusinessInformation.image_url) {
          await deleteFile(existingBusinessInformation.image_url);
        }
      }

      await business_informationService.updateBusinessInformation(id, updatedBusinessInformation);
      res.status(200).json({ message: 'Business information updated successfully' });
    } catch (error) {
      console.error('Error updating business information:', error);
      res.status(500).json({ error: error.message || 'Internal error while updating business information' });
    }
  },
  deleteBusinessInformation: async (req, res) => {
    try {
      const { id } = req.params;
      const businessInformation = await business_informationService.getBusinessInformationDetails(id);

      if (!businessInformation) {
        return res.status(404).json({ message: 'Business information not found' });
      }

      if (businessInformation.image_url) {
        await deleteFile(businessInformation.image_url);
      }

      await business_informationService.deleteBusinessInformation(id);
      res.status(200).json({ message: 'Business information deleted successfully' });
    } catch (error) {
      console.error('Error deleting business information:', error);
      res.status(500).json({ error: error.message || 'Internal error while deleting business information' });
    }
  },
}

module.exports = business_informationController;