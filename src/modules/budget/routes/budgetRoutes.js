const express = require("express");
const budgetController = require("../controllers/budgetController");
const authorization = require("../../../middlewares/middleware_roles/rolesMiddleware");
const authToken = require("../../../middlewares/authMiddleware");

const router = express.Router();

router.post("/", budgetController.createBudget);
router.get("/", authToken, authorization.accessLevel(4),budgetController.listBudgets);
router.get("/:id", authToken, authorization.accessLevel(4),budgetController.getBudgetById);
router.delete("/:id", authToken, authorization.accessLevel(4),budgetController.deleteBudget);

module.exports = router;
