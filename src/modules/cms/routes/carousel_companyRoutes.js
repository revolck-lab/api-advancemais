const express = require('express');
const carouselCompanyController = require('../controllers/carousel_companyController');
const authorization = require('../../../middlewares/middleware_roles/rolesMiddleware');

const router = express.Router();

router.get('/', authorization.accessLevel(4), carouselCompanyController.getAllCarouselCompany);
router.post('/', authorization.accessLevel(4),carouselCompanyController.createCarouselCompany);
router.put('/:id', authorization.accessLevel(4),carouselCompanyController.updateCarouselCompany);
router.delete('/:id', authorization.accessLevel(4),carouselCompanyController.deleteCarouselCompany);
router.get('/:id', authorization.accessLevel(4),carouselCompanyController.findByIdCompany);

module.exports = router;
