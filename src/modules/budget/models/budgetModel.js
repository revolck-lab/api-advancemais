const { knexInstance } = require("../../../config/db");

const budgetModel = {
  create: async (quotes) => {
    const db = await knexInstance();
    const [id] = await db("quotes").insert(quotes);
    return id;
  },
  findAll: async () => {
    const db = await knexInstance();
    return db("quotes").select();
  },
  findById: async (id) => {
    const db = await knexInstance();
    return db("quotes").where({ id }).first();
  },
  update: async (id, quotes) => {
    const db = await knexInstance();
    return db("quotes").where({ id }).update(quotes);
  },
  delete: async (id) => {
    const db = await knexInstance();
    return db("quotes").where({ id }).del();
  },
};

module.exports = budgetModel;
