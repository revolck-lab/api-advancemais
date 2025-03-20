const vacanciesService = require("../services/vacanciesService");
const vacanciesValidator = require("../validators/vacanciesValidator");

const vacanciesController = {
  listVacancies: async (req, res) => {
    try {
      const { company_id, created_at, limit, offset } = req.query;

      if (limit && (isNaN(limit) || limit <= 0)) {
        return res.status(400).json({ error: "Invalid limit parameter" });
      }
      if (offset && (isNaN(offset) || offset < 0)) {
        return res.status(400).json({ error: "Invalid offset parameter" });
      }

      const vacancies = await vacanciesService.listVacancies({
        company_id,
        created_at,
        limit,
        offset,
      });

      return res.status(200).json({
        message: "Vacancies retrieved successfully",
        data: vacancies,
      });
    } catch (err) {
      console.error("Error retrieving vacancies:", err.message);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  getVacancyDetails: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || !Number.isInteger(Number(id)) || id <= 0) {
        return res.status(400).json({ error: "Invalid vacancy ID" });
      }

      const vacancy = await vacanciesService.getVacancyDetails(id);

      if (!vacancy) {
        return res.status(404).json({ error: "Vacancy not found" });
      }

      return res.status(200).json({
        message: "Vacancy details retrieved successfully",
        data: vacancy,
      });
    } catch (error) {
      console.error("Error retrieving vacancy details:", error.message);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  createVacancy: async (req, res) => {
    try {
      const { company_id } = req.params;

      const maxVacancy = await vacanciesService.getVacancyDetailsCompany(company_id);
      if (maxVacancy.length >= 3) {
        return res.status(400).json({ error: "Company already has the maximum number of vacancies" });
      }

      if (!company_id ||!Number.isInteger(Number(company_id)) || company_id <= 0) {
        return res.status(400).json({ error: "Invalid company ID" });
      }

      const vacancyData = req.body;
      const { error } = vacanciesValidator.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const vacancy = await vacanciesService.create(company_id, vacancyData);
      if (!vacancy) {
        return res.status(400).json({ error: "Failed to create vacancy" });
      }

      return res.status(201).json({
        message: "Vacancy created successfully",
        data: vacancy,
      });
    } catch (error) {
      console.error("Error creating vacancy:", error.message);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  deleteVacancy: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id ||!Number.isInteger(Number(id)) || id <= 0) {
        return res.status(400).json({ error: "Invalid vacancy ID" });
      }

      const deleted = await vacanciesService.delete(id);

      if (!deleted) {
        return res.status(404).json({ error: "Vacancy not found" });
      }

      return res.status(204).json({ message: "Vacancy deleted successfully" });
    } catch (error) {
      console.error("Error deleting vacancy:", error.message);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  updateVacancy: async (req, res) => {
    try {
      const { id } = req.params;
      const vacancyData = req.body;

      if (!id ||!Number.isInteger(Number(id)) || id <= 0) {
        return res.status(400).json({ error: "Invalid vacancy ID" });
      }

      const updated = await vacanciesService.update(id, vacancyData);

      if (!updated) {
        return res.status(404).json({ error: "Vacancy not found" });
      }

      return res.status(200).json({ message: "Vacancy updated successfully" });
    } catch (error) {
      console.error("Error updating vacancy:", error.message);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};

module.exports = vacanciesController;