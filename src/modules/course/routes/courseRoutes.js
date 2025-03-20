const express = require("express");
const courseController = require("../../course/controllers/courseController");
const authorization = require("../../../middlewares/middleware_roles/rolesMiddleware");

const router = express.Router();

router.get("/getDetails/:id", courseController.getCourseDetails);
router.get("/get", courseController.getCourses);
router.post("/create", authorization.accessLevel(4), courseController.createCourse);

module.exports = router;
