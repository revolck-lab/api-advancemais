const courseService = require("../services/courseService");
const courseValidator = require("../validators/courseValidator");

const courseController = {
  createCourse: async (req, res) => {
    try {
      const { error } = courseValidator.validate(req.body);
      if (error) {
        return res.staus(400).json({ error: error.details[0].message });
      }

      const courseData = req.body;

      const courseId = await courseService.createCourse(courseData);

      return res.status(201).json({
        message: "Course created successfully",
        courseId,
      });
    } catch (error) {
      console.error("Error in createCourse controller:", error.message);
      return res.status(500).json({
        message: "Error creating course",
        error: error.message,
      });
    }
  },

  getCourseDetails: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'ID underfined' });
      }

      const courseDetails = await courseService.getCourseDetails(id);

      if (!courseDetails) {
        return res.status(404).json({
          message: "Course not found",
        });
      }

      return res.status(200).json({
        message: "Course details retrieved successfully",
        data: courseDetails,
      });
    } catch (error) {
      console.error("Error in getCourseDetails controller:", error.message);
      return res.status(500).json({
        message: "Error retrieving course details",
        error: error.message,
      });
    }
  },
  getCourses: async (req, res) => {
    try {
      const { category_id, modality_id } = req.query;
      if (!category_id && !modality_id) {
        return res.status(400).json({ message: 'One of the search parameters must be filled in' });
      }
  
      const courses = await courseService.getCourses({
        category_id,
        modality_id,
      });

      if (!courses) {
        return res.status(400).json({ message: 'Courses not found.' })
      }
  
      return res.status(200).json({
        message: 'Courses listed successfully!',
        date: courses.results,
        total: courses.total,
        totalPages: courses.totalPages,
        page: courses.page,
      });
    } catch (error) {
      console.error("Error when searching for courses:", error.message);
      return res.status(500).json({ message: 'Internal server error', error });
    }
  }
};

module.exports = courseController;
