const { knexInstance } = require("../../../config/db");

const courseImageModel = {
  create: async (courseImage) => {
    const db = await knexInstance();
    const [id] = await db("course_image").insert(courseImage);
    return id;
  },
  findById: async (id) => {
    const db = await knexInstance();
    return db("course_image").where({ id }).first();
  },
  update: async (id, courseImage) => {
    const db = await knexInstance();
    return db("course_image").where({ id }).update(courseImage);
  },
};

const courseThumbnailModel = {
  create: async (courseThumbnail) => {
    const db = await knexInstance();
    const [id] = await db("course_thumbnail").insert(courseThumbnail);
    return id;
  },
  findById: async (id) => {
    const db = await knexInstance();
    return db("course_thumbnail").where({ id }).first();
  },
  update: async (id, courseThumbnail) => {
    const db = await knexInstance();
    return db("course_thumbnail").where({ id }).update(courseThumbnail);
  },
};

const courseModel = {
  create: async (course) => {
    const db = await knexInstance();
    const [id] = await db("course").insert(course);
    return id; 
  },
  findById: async (id) => {
    const db = await knexInstance();
    return db("course")
      .select(
        "course.id",
        "course.title",
        "course.description",
        "course.price",
        "course.workload",
        "course.vacancies",
        "category.name as category_name",
        "modality.name as modality_name",
        "course_image.url as course_image_url",
        "course_thumbnail.thumbnail_url as thumbnail_url"
      )
      .leftJoin("category", "course.category_id", "category.id")
      .leftJoin("modality", "course.modality_id", "modality.id")
      .leftJoin("course_image", "course.course_image_id", "course_image.id")
      .leftJoin("course_thumbnail", "course.thumbnail_id", "course_thumbnail.id")
      .where("course.id", id)
      .first();
  },
  update: async (id, course) => {
    const db = await knexInstance();
    return db("course").where({ id }).update(course);
  },
  delete: async (id) => {
    const db = await knexInstance();
    return db("course").where({ id }).del();
  },
  listCourse: async (filters = {}, page = 1, limit = 10) => {
    const db = await knexInstance();
  
    page = Math.max(1, page);
    limit = Math.min(Math.max(1, limit), 100);
  
    filters = typeof filters === 'object' && filters !== null ? filters : {};
  
    const query = db('course')
      .select(
      "course.id",
        "course.title",
        "course.description",
        "course.price",
        "course.workload",
        "course.vacancies",
        "category.name as category_name",
        "modality.name as modality_name",
        "course_image.url as course_image_url",
        "course_thumbnail.thumbnail_url as thumbnail_url"
      )
      .leftJoin("category", "course.category_id", "category.id")
      .leftJoin("modality", "course.modality_id", "modality.id")
      .leftJoin("course_image", "course.course_image_id", "course_image.id")
      .leftJoin("course_thumbnail", "course.thumbnail_id", "course_thumbnail.id")
  
    if (filters.category_id) query.where('course.category_id', filters.category_id);
    if (filters.modality_id) query.where('course.modality_id', filters.modality_id);
  
    const offset = (page - 1) * limit;
    query.limit(limit).offset(offset);
  
    const totalQuery = db('course')
      .count('id as total')
      .modify((qb) => {
        if (filters.category_id) qb.where('course.category_id', filters.category_id);
        if (filters.modality_id) qb.where('course.modality_id', filters.modality_id);
      })
      .first();
  
    const [results, { total }] = await Promise.all([query, totalQuery]);
  
    return {
      results,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }      
};

module.exports = {
  courseImageModel,
  courseThumbnailModel,
  courseModel,
};
