const express = require("express");
const authToken = require("../../../middlewares/authMiddleware");
const userController = require("../controllers/userController");
const authorization = require("../../../middlewares/middleware_roles/rolesMiddleware");

const router = express.Router();

router.get("/welcome", authToken, (req, res) => {
  res.status(200).json({ message: "Welcome!!" });
});

router.post("/login", userController.login);
router.post("/register", userController.register);

router.get(
  "/permission/student",
  authToken,
  authorization.student,
  (req, res) => {
    res.json({ message: "Access granted: Student" });
  }
);

router.get(
  "/permission/teacher",
  authToken,
  authorization.teacher,
  (req, res) => {
    res.json({ message: "Access granted: Teacher" });
  }
);

router.get(
  "/permission/company",
  authToken,
  authorization.company,
  (req, res) => {
    res.json({ message: "Access granted: Company" });
  }
);

router.get(
  "/permission/admin",
  authToken,
  authorization.accessLevel(3),
  (req, res) => {
    res.json({ message: "Access granted: Admin" });
  }
);

module.exports = router;
