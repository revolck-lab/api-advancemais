const express = require('express');
const vacanciesController = require('../controllers/vacanciesController');
const authorization = require('../../../middlewares/middleware_roles/rolesMiddleware');

const router = express.Router();

router.get('/', authorization.accessLevel(1, 2, 8), vacanciesController.listVacancies);
router.get('/:id', authorization.accessLevel(1, 2, 8),vacanciesController.getVacancyDetails);
router.post('/', authorization.accessLevel(4), vacanciesController.createVacancy);
router.put('/:id', authorization.accessLevel(7), vacanciesController.updateVacancy);
router.delete('/:id', authorization.accessLevel(7), vacanciesController.deleteVacancy);

module.exports = router;

