const vacancyModel = require("../models/vacanciesModel");

const MAX_LIMIT = 100;

const cleanFilters = (filters) => {
  const cleanedFilters = {};
  for (const key in filters) {
    if (filters[key] != null) {
      cleanedFilters[key] = filters[key];
    }
  }
  return cleanedFilters;
};

const vacanciesService = {
  listVacancies: async (queryParams) => {
    const {
      company_id,
      created_at,
      limit,
      offset,
    } = queryParams;

    const filters = cleanFilters({
      company_id,
      created_at,
    });

    const paginationLimit = Math.min(parseInt(limit, 10) || 10, MAX_LIMIT);
    const paginationOffset = parseInt(offset, 10) || 0;

    return await vacancyModel.list(filters, paginationLimit, paginationOffset);
  },

  getVacancyDetails: async (id) => {
    return await vacancyModel.findById(id);
  },

  getVacancyDetailsCompany: async (company_id) => {
    return await vacancyModel.findByCompanyId(company_id);
  },

  deleteVacancy: async (id) => {
    return await vacancyModel.delete(id);
  },

  updateVacancy: async (id, vacancyData) => {
    return await vacancyModel.update(id, vacancyData);
  },

  createVacancy: async (companyId) => {
    return await vacancyModel.create(companyId);
  },
};

module.exports = vacanciesService;
