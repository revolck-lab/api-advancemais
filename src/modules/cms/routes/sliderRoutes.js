const express = require('express');
const sliderController = require('../controllers/sliderController');
const authorization = require('../../../middlewares/middleware_roles/rolesMiddleware');
const multer = require('../../../middlewares/middleware_multer/multerMiddleware');

const router = express.Router();

router.get('/', authorization.accessLevel(4,7,8), sliderController.listSliders);
router.post('/', authorization.accessLevel(4,7,8), multer.single("image_url"), sliderController.addSlider);
router.put('/:id', authorization.accessLevel(4,7,8), multer.single("image_url"), sliderController.editSlider);
router.delete('/:id', authorization.accessLevel(4,7,8), multer.single("image_url"), sliderController.deleteSlider);

module.exports = router;