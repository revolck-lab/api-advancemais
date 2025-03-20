const express = require('express');
const router = express.Router();
const carouselController = require('../controllers/carouselController');
const authorization = require('../../../middlewares/middleware_roles/rolesMiddleware');

router.get('/', authorization.accessLevel(4), carouselController.getAll);
router.get('/:id', authorization.accessLevel(4), carouselController.getById);
router.post('/', authorization.accessLevel(4), carouselController.create);
router.put('/:id', authorization.accessLevel(4), carouselController.update);
router.delete('/:id', authorization.accessLevel(4),carouselController.delete);

module.exports = router;
