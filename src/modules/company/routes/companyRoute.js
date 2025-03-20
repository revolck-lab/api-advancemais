const express = require('express');
const companyController = require('../controllers/companyController');
const authtoken = require('../../../middlewares/authMiddleware');
const authorization = require('../../../middlewares/middleware_roles/rolesMiddleware');
const router = express.Router();

router.get('/', authtoken, authorization.accessLevel(8), companyController.getAllCompanies);
router.get('/cnpj/:cnpj', authtoken, authorization.accessLevel(8), companyController.getCompanyByCnpj);
router.get('/:id', companyController.getCompanyById);
router.post('/', companyController.createCompany);
router.put('/:id', authtoken, authorization.accessLevel(8), companyController.updateCompany);
router.delete('/:id', authtoken, authorization.accessLevel(8), companyController.deleteCompany);

module.exports = router;