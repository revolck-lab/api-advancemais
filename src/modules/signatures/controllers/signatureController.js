const { signaturePackageService, signatureService } = require('../services/signatureService');
const { packageValidation, signatureValidation } = require('../validators/signaturesValidator');

const signaturePackageController = {
  getAllPackages: async (req, res) => {
    try {
      const packages = await signaturePackageService.getSignature();
      if (!packages) {
        return res.status(404).json({ error: 'Packages not found' });
      }

      return res.status(200).json(packages);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  getPackageDetails: async (req, res) => {
    try {
      const { id } = req.params;
      const packageDetails = await signaturePackageService.getSignatureById(id);
      if (!packageDetails) {
        return res.status(404).json({ error: 'Package not found' });
      }

      return res.status(200).json(packageDetails);
    } catch (error) {
      return res.status(404).json({ error: 'Package not found' });
    }
  },
  createPackage: async (req, res) => {
    try {
      const { error } = await packageValidation.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const packageData = req.body;

      const packageId = await signaturePackageService.createSignature(packageData);
      return res.status(201).json({ message: 'Package created successfully', packageId });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: error.message || 'Failed to create package' });
    }
  },

  updatePackage: async (req, res) => {
    try {
      const { companyId } = req.params;
      const { error } = packageValidation.validate(req.body);
  
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
  
      const { newPackageId } = req.body;
      const response = await signatureService.upgradeDowngradePackage(companyId, newPackageId);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  deletePackage: async (req, res) => {
    try {
      const { id } = req.params;
      await signatureService.deletePackage(id);
      res.status(200).json({ message: 'Package deleted successfully' });
    } catch (error) {
      res.status(404).json({ error: 'Package not found' });
    }
  },
};

const signatureController = {
  getAllSignatures: async (req, res) => {
    try {
      const signatures = await signatureService.getAllSignatures();
      res.json(signatures);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getSignatureDetails: async (req, res) => {
    try {
      const { id } = req.params;
      const signatureDetails = await signatureService.getSignatureDetails(id);
      res.json(signatureDetails);
    } catch (error) {
      res.status(404).json({ error: 'Signature not found' });
    }
  },
  createSignature: async (req, res) => {
    try {
      const { error } = await signatureValidation.validate(req, res);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const signatureData = req.body;

      const signatureId = await signatureService.createSignature(signatureData);
      res.status(201).json({ message: 'Signature created successfully', signatureId });
    } catch (error) {
      res.status(500).json({ error: error.message || 'Failed to create signature' });
    }
  },
  updateSignature: async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await signatureValidation.validate(req, res);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const updatedSignature = req.body;
      await signatureService.updateSignature(id, updatedSignature);
      res.status(200).json({ message: 'Signature updated successfully' });
    } catch (error) {
      res.status(404).json({ error: 'Signature not found' });
    }
  },
  deleteSignature: async (req, res) => {
    try {
      const { id } = req.params;
      await signatureService.deleteSignature(id);
      res.status(200).json({ message: 'Signature deleted successfully' });
    } catch (error) {
      res.status(404).json({ error: 'Signature not found' });
    }
  },
  cancelSignatureCompany: async (req, res) => {
    try {
      const { companyId } = req.params;
      const response = await signatureService.cancelSignature(companyId);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  },
}

module.exports = {
  signaturePackageController,
  signatureController,
};
