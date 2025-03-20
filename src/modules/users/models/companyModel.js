const { knexInstance } = require("../../../config/db");

const companyModel = {
  create: async (company) => {
    const db = await knexInstance();
    const [id] = await db("company").insert(company);
    return id;
  },
  findByCnpj: async (cnpj) => {
    const db = await knexInstance();
    return db("company").where({ cnpj }).first();
  },
  findById: async (id) => {
    const db = await knexInstance();
    return db("company").where({ id }).first();
  },
  findByStatus: async (status) => {
    const db = await knexInstance();
    return db("company").where({ status });
  },
  update: async (id, company) => {
    const db = await knexInstance();
    return db("company").where({ id }).update(company);
  },
  updatePassword: async (cnpj, hashedPassword) => {
    const db = await knexInstance();
    return db('company').where({ cnpj }).update({ password: hashedPassword });
  },  
  delete: async (id) => {
    const db = await knexInstance();
    return db("company").where({ id }).del();
  },
  findByEmail: async (email) => {
    const db = await knexInstance();
    return db("company").where({ email }).first();
  },
  findByRole: async (role_id) => {
    const db = await knexInstance();
    return db("company").where({ role_id });
  },
};

module.exports = companyModel;
