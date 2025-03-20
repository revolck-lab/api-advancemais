const express = require("express");
const recoveryController = require("../controllers/passwordRecoveryController");
const authTokenPassword = require("../../../middlewares/passwordTokenMiddleware");

const router = express.Router();

router.post("/recovery", recoveryController.requestPasswordRecovery);
router.put("/reset/", authTokenPassword, recoveryController.resetPassword);

module.exports = router;
