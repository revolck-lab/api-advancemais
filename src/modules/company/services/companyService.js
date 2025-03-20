const companyModel = require('../models/companyModel');
const addressModel = require('../../users/models/addressModel');
const bcrypt = require('bcrypt');

const companyService = {
  getAllCompanies: async () => {
    return await companyModel.getAllCompanies();
  },
  getCompanyByCnpj: async (cnpj) => {
    return await companyModel.getCompanyByCnpj(cnpj);
  },
  getCompanyById: async (id) => {
    return await companyModel.getCompanyById(id);
  },
  getCompaniesByStatus: async (status) => {
    return await companyModel.getCompaniesByStatus(status);
  },
  updateCompany: async (id, company) => {
    await companyModel.updateCompany(id, company);
  },
  deleteCompany: async (id) => {
    await companyModel.deleteCompany(id);
  },
  createCompany: async (companyData) => {
    const {
        cnpj,
        trade_name,
        business_name,
        contact_name,
        address,
        number,
        city,
        state_id,
        cep,
        whatsapp,
        mobile_phone,
        landline_phone,
        email,
        password,
        role_id
    } = companyData;

    // Verifica se o e-mail e o CNPJ já existem
    const [emailExists, cnpjExists] = await Promise.all([
        companyModel.findByEmail(email),
        companyModel.findByCnpj(cnpj)
    ]);

    if (emailExists) {
        return { error: 'Email already registered' };
    }

    if (cnpjExists) {
        return { error: 'CNPJ already registered' };
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o endereço e obtém o ID
    const addressData = {
        address,
        number,
        city,
        state_id,
        cep
    };

    const addressId = await addressModel.create(addressData);

    // Dados da empresa
    const companyDataForValidation = {
        cnpj,
        trade_name,
        business_name,
        contact_name,
        address,  // Mantemos o endereço completo para validação
        number,
        city,
        state_id,
        cep,
        whatsapp,
        mobile_phone,
        landline_phone,
        email,
        password,
        role_id
    };

    // Valida os dados
    // const { error } = companyValidation.validate(companyDataForValidation);
    // if (error) {
    //     return { error: error.details[0].message };
    // }

    // Cria a empresa no banco
    const companyId = await companyModel.createCompany({
        cnpj,
        trade_name,
        business_name,
        contact_name,
        address_id: addressId, // Aqui passa apenas o ID do endereço
        whatsapp,
        mobile_phone,
        landline_phone,
        email,
        password: hashedPassword,
        role_id
    });

    // Busca a empresa recém-criada
    const newCompany = await companyModel.getCompanyById(companyId);
    delete newCompany.password; // Remove a senha da resposta

    return { company: newCompany };
  }
};

module.exports = companyService;
