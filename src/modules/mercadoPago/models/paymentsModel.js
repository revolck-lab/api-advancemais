const { knexInstance } = require('../../../config/db');

const paymentsModel = {
  createPaymentModel: async (payment) => {
    const db = await knexInstance();
    const [id] = await db('company_payments').insert(payment);
    return db('company_payments').where({ id }).first(); // Retorna o objeto completo
  },
  getPaymentByPaymentIdModel: async (paymentId) => {
    const db = await knexInstance();
    return db('company_payments').where({ payment_id: paymentId }).first();
  },
  updatePaymentByPreferenceIdModel: async (mpPreferenceId, status) => {
    const db = await knexInstance();
    return db('company_payments')
      .where({ mp_preference_id: mpPreferenceId })
      .update({ status });
  },
  updatePaymentByPaymentIdModel: async (paymentId, status) => {
    const db = await knexInstance();
    return db('company_payments')
      .where({ payment_id: paymentId })
      .update({ status });
  },
  getPaymentByIdModel: async (id) => {
    const db = await knexInstance();
    return db('company_payments').where({ id }).first();
  },
  getAllPaymentsModel: async () => {
    const db = await knexInstance();
    return db('company_payments').select('*');
  },
  getPaymentByCompanyModel: async (company_id) => {
    const db = await knexInstance();
    return db('company_payments').where({ company_id }).first();
  },
  getCompanyModel: async (company_id) => {
    const db = await knexInstance();
    return db('company').where({ id: company_id }).first();
  },
  getPackageModel: async (package_id) => {
    const db = await knexInstance();
    return db('signatures_packages').where({ id: package_id }).first();
  },
  getAddressModel: async (address_id) => {
    const db = await knexInstance();
    return db('address').where({ id: address_id }).first();
  },
  getStateModel: async (address_id) => {
    const db = await knexInstance();
    return db('state').where({ id: address_id }).first();
  }
};

module.exports = paymentsModel; 