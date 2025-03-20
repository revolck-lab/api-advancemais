const express = require('express');
const authToken = require('../../../middlewares/authMiddleware');
const authorization = require('../../../middlewares/middleware_roles/rolesMiddleware');
const mercadopagoController = require('../controllers/paymentsController'); // Importe as funções corretamente

const router = express.Router();

// router.get('/payment', authToken, authorization.accessLevel(3, 7, 8), getAllPaymentsHandler);
// router.get('/company/:company_id', authToken, authorization.accessLevel(3, 7, 8), getPaymentByCompanyHandler);
router.post('/create', mercadopagoController.createPaymentController);
router.get('/user', mercadopagoController.getUseMercadoPago);

// router.post('/checkout/webhook', (req, res, next) => {
//   const secret = req.query.secret || req.body.secret;
//   if (secret !== process.env.WEBHOOK_SECRET) {
//     return res.status(403).json({ error: 'Invalid webhook secret' });
//   }
//   next();
// }, webhookHandler);

module.exports = router;