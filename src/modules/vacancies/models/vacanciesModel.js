const { knexInstance } = require("../../../config/db");

const vacancyModel = {
  list: async (filters, limit, offset) => {
    const db = await knexInstance();
    const query = db("vacancy")
      .select(
        "vacancy.id",
        "vacancy.title",
        "vacancy.created_at",
        "company.trade_name as company_name"
      )
      .join("company", "vacancy.company_id", "company.id")
      .where("company.status", 1)
      .orderBy("vacancy.created_at", "desc");

    if (filters.company_id) query.where("vacancy.company_id", filters.company_id);
    if (filters.created_at) query.where("vacancy.created_at", filters.created_at);

    if (limit) query.limit(limit);
    if (offset) query.offset(offset);

    const results = await query;
    return results;
  },

  findById: async (id) => {
    const db = await knexInstance();
    return db("vacancy")
      .select(
        "vacancy.id",
        "vacancy.title",
        "vacancy.requirements",
        "vacancy.activities",
        "vacancy.benefits",
        "vacancy.notes",
        "vacancy.start_date",
        "vacancy.end_date",
        "vacancy.status",
        "vacancy.created_at",
        "company.trade_name as company_name",
      )
      .join("company", "vacancy.company_id", "=", "company.id")
      .where("vacancy.id", id)
      .first();
  },

  delete: async (id) => {
    const db = await knexInstance();
    return db("vacancy").where({ id }).del();
  },

  update: async (id, vacancyData) => {
    const db = await knexInstance();
    return db("vacancy").where({ id }).update(vacancyData);
  },

  create: async (id) => {
    const db = await knexInstance();
    return db("vacancy").insert({ company_id: id });
  },
};

module.exports = vacancyModel;