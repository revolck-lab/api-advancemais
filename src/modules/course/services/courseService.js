const { courseImageModel, courseModel, courseThumbnailModel } = require("../models/courseModel");

const courseService = {
  createCourse: async (courseData) => {
    try {
      const {
        title,
        description,
        category_id,
        instructor_id,
        modality_id,
        workload,
        vacancies,
        price,
        start_time,
        end_time,
        course_image,
        course_thumbnail,
      } = courseData;

      const imageId = await courseImageModel.create(course_image);

      const thumbnailId = await courseThumbnailModel.create(course_thumbnail);

      const newCourse = {
        title,
        description,
        category_id,
        instructor_id,
        course_image_id: imageId,
        thumbnail_id: thumbnailId,
        modality_id,
        workload,
        vacancies,
        price,
        start_time,
        end_time,
      };

      const courseId = await courseModel.create(newCourse);

      return courseId;
    } catch (error) {
      console.error("Error in createCourse service:", error.message);
      throw error;
    }
  },

  getCourseDetails: async (id) => {
    try {
      const course = await courseModel.findById(id);

      if (!course) {
        return null;
      }

      const formattedCourse = {
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        workload: course.workload,
        vacancies: course.vacancies,
        category_name: course.category_name,
        modality_name: course.modality_name,
        image_url: course.course_image_url,
        thumbnail_url: course.thumbnail_url,
      };

      return formattedCourse;
    } catch (error) {
      console.error("Error in getCourseDetails service:", error.message);
      throw error;
    }
  },

  getCourses: async (filters) => {
    try {
      const courses = await courseModel.listCourse(filters);
      return courses;
    } catch (error) {
      console.error('Erro ao recuperar cursos:', error.message);
      throw error;
    }
  }
  
};

module.exports = courseService;
