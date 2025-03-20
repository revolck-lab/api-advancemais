const companyService = require('../services/companyService');
const companyValidation = require('../validatiors/companyValidation');

const companyController = {
  getAllCompanies: async (req, res) => {
    try {
      const companies = await companyService.getAllCompanies();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getCompanyByCnpj: async (req, res) => {
    try {
      const { cnpj } = req.params;
      const company = await companyService.getCompanyByCnpj(cnpj);

      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      res.json(company);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getCompanyById: async (req, res) => {
    try {
      const { id } = req.params;
      const company = await companyService.getCompanyById(id);

      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      res.json(company);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  createCompany: async (req, res) => {
    try {
      const { error } = companyValidation.validate(req.body);

      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const company = req.body;
      const createdCompany = await companyService.createCompany(company);

      res.status(201).json(createdCompany);
    } catch (error) {
      console.log("error: ", error);
      res.status(500).json({ error: "Internal error while registering company" });
    }
  },
  updateCompany: async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = companyValidation.validate(req.body);

      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const updatedCompany = await companyService.updateCompany(id, req.body);

      if (!updatedCompany) {
        return res.status(404).json({ message: 'Company not found' });
      }

      res.json(updatedCompany);
    } catch (error) {
      res.status(500).json({ error: "Internal error while updating company" });
    }
  },
  deleteCompany: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedCompany = await companyService.deleteCompany(id);

      if (!deletedCompany) {
        return res.status(404).json({ message: 'Company not found' });
      }

      res.status(200).json({ message: 'Company deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: "Internal error while deleting company" });
    }
  },
}

module.exports = companyController;