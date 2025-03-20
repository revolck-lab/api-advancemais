const sliderService = require('../services/sliderService');
const { upload, deleteFile } = require('../../../services/awsService');

const sliderController = {
  listSliders: async (req, res) => {
    try {
      const sliders = await sliderService.getAllSliders();
      if (!sliders.length) {
        return res.status(204).json({ message: 'No slider was returned' });
      }
      res.json(sliders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  addSlider: async (req, res) => {
    try {
      const { title, url_link, device } = req.body;
      const { id } = req.user;
      
      if (!req.file || !title || !device || !url_link) {
        return res.status(400).json({ message: 'Title, device, url and image are required' });
      }

      if (!['Web', 'Mobile'].includes(device)) {
        return res.status(400).json({ message: 'Invalid device type' });
      }

      const { buffer, mimetype, originalname } = req.file;
      const result = await upload(`path/to/slider/${originalname}`, buffer, mimetype);

      const slider = {
        title,
        image_url: result.url,
        device,
        url_link,
        author_id: id,
      };

      const createSlider = await sliderService.createSlider(slider);

      res.status(201).json({ message: "Slider created successfully.", createSlider });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  editSlider: async (req, res) => {
    try {
      const { id } = req.params;
      const slider = req.body;
      const user_id = req.user.id;

      if (!slider.title &&!req.file) {
        return res.status(400).json({ message: 'Title and/or image are required' });
      }

      const existingSlider = await sliderService.getSliderDetails(id);
      if (!existingSlider) {
        return res.status(404).json({ message: 'Slider not found.' });
      }

      const updatedSlider = { 
        title: slider.title, 
        author_id: user_id,
        device: slider.device,
        url_link: slider.url_link,
      };

      if (req.file) {
        const { buffer, mimetype, originalname } = req.file;
        // upload da nova imagem para o s3
        const result = await upload(`path/to/slider/${originalname}`, buffer, mimetype);
        updatedSlider.image_url = result.url;

        // verifica se a URL da imagem antiga está presente para deleta-lá.
        if (existingSlider.image_url) {
          await deleteFile(existingSlider.image_url);
        }
      }

      await sliderService.updateSlider(id, updatedSlider);
      
      res.json({ message: "Slider updated successfully" });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },
  deleteSlider: async (req, res) => {
    try {
      const { id } = req.params;
      const slider = await sliderService.getSliderDetails(id);

      if (!id) {
        return res.status(400).json({ message: 'Slider ID is required.' });
      };

      if (!slider) {
        return res.status(404).json({ message: 'Slider not found.' });
      };

      if (slider.image_url) {
        await deleteFile(slider.image_url);
      };

      await sliderService.deleteSlider(id);
      res.json({ message: "Slider deleted successfully" });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },
}

module.exports = sliderController;