const bannerService = require('../services/bannerService');
const { upload, deleteFile } = require('../../../services/awsService');

const bannerController = {
  listBanners: async (req, res) => {
    try {
      const banners = await bannerService.getAllBanners();
      if (!banners.length) {
        return res.status(204).json({ message: 'No banner was returned' });
      }
      res.status(200).json(banners);
    } catch (err) {
      console.error('Error listing banners:', err);
      res.status(500).json({ error: 'Internal error while listing banners' });
    }
  },
  addBanner: async (req, res) => {
    try {
      const { title, url_link } = req.body;
      const { id } = req.user;

      if (!req.file || !title || !url_link) {
        return res.status(400).json({ message: 'Title, device, url and image are required' });
      }

      const { buffer, mimetype, originalname } = req.file;
      const result = await upload(`path/to/banner/${originalname}`, buffer, mimetype);

      const banner = {
        title,
        image_url: result.url,
        url_link,
        author_id: id,
      };

      const createBanner = await bannerService.createBanner(banner);

      return res.status(201).json({ message: 'Banner created successfully', createBanner });
    } catch (error) {
      console.error('Error creating banner:', error);
      res.status(500).json({ error: 'Internal error while creating banner' });
    }
  },
  editBanner: async (req, res) => {
    try {
      const { id } = req.params;
      const banner = req.body;
      const user_id = req.user.id;

      if (!banner.title && !req.file) {
        return res.status(400).json({ message: 'Title and/or image are required' });
      }

      const existingBanner = await bannerService.getBannerById(id);
      if (!existingBanner) {
        return res.status(404).json({ message: 'Banner not found' });
      }

      const updatedBanner = {
        title: banner.title,
        author_id: user_id,
        url_link: banner.url_link,
      };

      if (req.file) {
        const { buffer, mimetype, originalname } = req.file;
        const result = await upload(`path/to/banner/${originalname}`, buffer, mimetype);
        updatedBanner.image_url = result.url;

        if (existingBanner.image_url) {
          await deleteFile(existingBanner.image_url);
        }
      }

      await bannerService.updateBanner(id, updatedBanner);
      return res.status(200).json({ message: 'Banner updated successfully' });
    } catch (err) {
      console.error('Error updating banner:', err);
      res.status(500).json({ error: 'Internal error while updating banner' });
    }
  },
  deleteBanner: async (req, res) => {
    try {
      const { id } = req.params;
      const banner = await bannerService.getBannerDetails(id);

      if (!id) {
        return res.status(400).json({ message: 'Banner not found' });
      };

      if (!banner) {
        return res.status(404).json({ message: 'Banner not found' });
      };

      if (banner.image_url) {
        await deleteFile(banner.image_url);  // Delete the image from AWS S3.
      };

      await bannerService.deleteBanner(id);
      res.status(200).json({ message: 'Banner removed successfully' });
    } catch (err) {
      console.error('Error removing banner:', err);
      res.status(500).json({ error: 'Internal error while removing banner' });
    }
  }
};

module.exports = bannerController;
