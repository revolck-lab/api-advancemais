const { knexInstance } = require('../../../config/db');

const companyModel = {
  getAllCompanies: async () => {
    const db = await knexInstance(); // Note o await aqui
    return db('company');
  },
  getCompanyByCnpj: async (cnpj) => {
    const db = await knexInstance(); // Note o await aqui
    return db('company').where({ cnpj }).first();
  },
  getCompanyById: async (id) => {
    const db = await knexInstance(); // Note o await aqui
    return db('company').where({ id }).first();
  },
  getCompaniesByStatus: async (status) => {
    const db = await knexInstance(); // Note o await aqui
    return db('company').where({ status });
  },
  updateCompany: async (id, company) => {
    const db = await knexInstance(); // Note o await aqui
    return db('company').where({ id }).update(company);
  },
  deleteCompany: async (id) => {
    const db = await knexInstance(); // Note o await aqui
    return db('company').where({ id }).del();
  },
  createCompany: async (company) => {
    const db = await knexInstance(); // Note o await aqui
    const [id] = await db('company').insert(company);
    return id;
  },
  findByEmail: async (email) => {
    const db = await knexInstance(); // Note o await aqui
    const company = await db('company').where({ email }).first();
    return company;
  },
  findByCnpj: async (cnpj) => {
    const db = await knexInstance(); // Note o await aqui
    const company = await db('company').where({ cnpj }).first();
    return company;
  },
};

module.exports = companyModel;