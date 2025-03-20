const { signaturePackageModel, signatureModel } = require('../model/signatureModel');

const signaturePackageService = {
  getSignature: async () => {
    const packages = await signaturePackageModel.getAllSignature();
    if (packages.length <= 0) {
      return null;
    }
    return packages;
  },
  getSignatureById: async (id) => {
    const signature = await signaturePackageModel.getSignatureById(id);
    return signature;
    },
  updateSignature: async (id, signature) => {
    await signaturePackageModel.updateSignature(id, signature);
    return true;
  },
  createSignature: async (signature) => {
    const id = await signaturePackageModel.createSignature(signature);
    return id;
  },
  deleteSignature: async (id) => {
    await signaturePackageModel.deleteSignature(id);
    return true;
  },  
};

const signatureService = {
  getSignature: async () => {
    const signature = await signatureModel.getAllSignatures();
    return signature;
    },
  getSignatureById: async (id) => {
    const signature = await signatureModel.getSignatureById(id);
    return signature;
    },
  updateSignature: async (id, signature) => {
    await signatureModel.updateSignature(id, signature);
    return true;
    },
  createSignature: async (signature) => {
    const id = await signatureModel.createSignature(signature);
    return id;
    },
  deleteSignature: async (id) => {
    await signatureModel.deleteSignature(id);
    return true;
    },
  
  cancelSignature: async (companyId) => {
    signature = await signatureModel.getSignatureById(companyId);
  
    if (signature) {
      throw new Error("Subscription not found or already canceled");
    }
  
    await signatureModel.cancelSignature(companyId)
    return { message: "Subscription successfully cancelled" };
  },
};

module.exports = {
  signaturePackageService,
  signatureService,
};