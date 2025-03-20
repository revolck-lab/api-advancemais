const express = require('express');
const bannerController = require('../controllers/bannerController');
const authorization = require('../../../middlewares/middleware_roles/rolesMiddleware');
const multer = require('../../../middlewares/middleware_multer/multerMiddleware');

const router = express.Router();

router.get('/', authorization.accessLevel(4,7,8), bannerController.listBanners);
router.post('/', authorization.accessLevel(4,7,8), multer.single("image_url"), bannerController.addBanner);
router.put('/:id', authorization.accessLevel(4,7,8), multer.single("image_url"), bannerController.editBanner);
router.delete('/:id', authorization.accessLevel(4,7,8), multer.single("image_url"), bannerController.deleteBanner);

module.exports = router;
