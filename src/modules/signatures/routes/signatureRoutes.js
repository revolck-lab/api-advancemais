const express = require('express');
const { signatureController, signaturePackageController } = require('../controllers/signatureController');
const authorization = require('../../../middlewares/middleware_roles/rolesMiddleware');
const authToken = require('../../../middlewares/authMiddleware');

const router = express.Router();

router.get('/package', signaturePackageController.getAllPackages);
router.get('/package/:id', signaturePackageController.getPackageDetails);
router.post('/package', authToken, authorization.accessLevel(4), signaturePackageController.createPackage);
router.put('/package/:id', authToken, authorization.accessLevel(4), signaturePackageController.updatePackage);
router.delete('/package/:id', authToken, authorization.accessLevel(4), signaturePackageController.deletePackage);

router.get('/', authToken, authorization.accessLevel(4), signatureController.getAllSignatures);
router.get('/:id', authToken, authorization.accessLevel(4), signatureController.getSignatureDetails);
router.post('/', authToken, authorization.accessLevel(4), signatureController.createSignature);
router.put('/update/:id', authToken, authorization.accessLevel(4), signatureController.updateSignature);
router.delete('/delete/:id', authToken, authorization.accessLevel(4), signatureController.deleteSignature);
router.put('/cancel/:id', authToken, authorization.accessLevel(4), signatureController.cancelSignatureCompany);

module.exports = router;