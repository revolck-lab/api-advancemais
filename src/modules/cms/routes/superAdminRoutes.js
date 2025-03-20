const express = require('express');
const authorization = require('../../../middlewares/middleware_roles/rolesMiddleware');
const superAdminController = require('../controllers/superAdminController');
const multer = require('../../../middlewares/middleware_multer/multerMiddleware');

const router = express.Router();

router.get('/smtp', authorization.accessLevel(8), superAdminController.getSmtpServer);
router.post('/smtp', authorization.accessLevel(8), superAdminController.CreateSmtp);
router.put('/smtp/:id', authorization.accessLevel(8), superAdminController.updateSmtp);

//site information

router.get('/site-info/:id', authorization.accessLevel(8), superAdminController.getSiteInformation);
router.post('/site-info', authorization.accessLevel(8), multer.single("favicon_url"), superAdminController.addSiteInformation);
router.put('/site-info/:id', authorization.accessLevel(8), multer.single("favicon_url"), superAdminController.editSiteInformation);

module.exports = router;