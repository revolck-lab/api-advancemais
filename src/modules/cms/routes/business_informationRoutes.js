const express = require('express');
const authorization = require('../../../middlewares/middleware_roles/rolesMiddleware');
const multer = require('../../../middlewares/middleware_multer/multerMiddleware');
const business_informationController = require('../controllers/business_informationController');

const router = express.Router();

router.get('/', authorization.accessLevel(4,7,8), business_informationController.listBusinessInformation);
router.post('/', authorization.accessLevel(4,7,8), multer.single("image_url"), business_informationController.addBusinessInformation);
router.put('/:id', authorization.accessLevel(4,7,8), multer.single("image_url"), business_informationController.editBusinessInformation);
router.delete('/:id', authorization.accessLevel(4,7,8), multer.single("image_url"), business_informationController.deleteBusinessInformation);

module.exports = router;