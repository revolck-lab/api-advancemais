const paymentsModel = require('../models/paymentsModel');
const { knexInstance } = require('../../../config/db');

// const createPaymentService = async (body_payment) => {
//   // Criar uma instância do Mercado Pago com autenticação
//   const client = new MercadoPagoConfig({
//     accessToken: process.env.MP_ACCESS_TOKEN,
//   });

//   const db = await knexInstance();
//   const company = await db('company').where({ id: body_payment.company_id }).first();
//   const package = await db('signatures_packages').where({ id: body_payment.package_id }).first();

//   // Verifica se os dados de pacotes e empresas existem
//   if (!company || !package) {
//     throw new Error("Couldn't find company or package in database");
//   }
//   console.log("Found company", company);
//   console.log("Found package", package);
//   // Verifica se a BASE_URL está definida corretamente
//   if (!process.env.FRONTEND_URL || !process.env.MP_ACCESS_TOKEN) {
//     throw new Error('Invalid credentials required for authentication');
//   }

//   const notificationUrl = `${process.env.FRONTEND_URL}/api/checkout/webhook?secret=${process.env.MP_ACCESS_TOKEN}`;

//   // Valida se a URL é válida antes de enviar
//   try {
//     new URL(notificationUrl);
//   } catch (error) {
//     throw new Error(`Invalid URL: ${notificationUrl}`);
//   }

//   const payment = new Payment(client);
//   const paymentData = await payment.create({
//     body: {
//       transaction_amount: parseFloat(package.price),
//       description: `Pacote: ${package.name}`,
//       payment_method_id: body_payment.payment_method,
//       payer: { 
//         email: company.email,
//       }
//     },
//   });

//   // �� Log dos dados enviados ao Mercado Pago para debug
//   console.log("Dados enviados ao Mercado Pago:", JSON.stringify({
//     transaction_amount: Number(package.price),
//     description: `Pacote: ${package.name}`,
//     payment_method_id: body_payment.payment_method,
//     payer: { 
//       email: company.email,
//       first_name: company.name,
//     }
//   }, null, 2));
//     // 🔍 Log da resposta do Mercado Pago para debug
//   // console.log("Resposta do Mercado Pago:", JSON.stringify(paymentData, null, 2));

//   // 🔍 Verifica se a resposta contém os dados esperados
//   if (!paymentData || !paymentData.body || !paymentData.body.id) {
//     throw new Error(`Error creating payment: Invalid response from Mercado Pago - ${JSON.stringify(paymentData)}`);
//   }

//   // 🔍 Verifica se os campos opcionais existem antes de acessá-los
//   const pointOfInteraction = paymentData.body.point_of_interaction;
//   const transactionData = pointOfInteraction ? pointOfInteraction.transaction_data : null;

//   const paymentDataToSave = {
//     company_id: company.id,
//     package_id: package.id,
//     mp_preference_id: paymentData.body.id,
//     status: 'PENDING',
//     payment_id: paymentData.body.id,
//   };

//   await paymentsModel.createPaymentModel(paymentDataToSave);

//   return {
//     response: paymentData,
//     qr_code_base64: transactionData ? transactionData.qr_code_base64 : null, 
//     ticket_url: transactionData ? transactionData.ticket_url : null,
//     paymentId: paymentData.body.id,
//   };
// };

// const updatePaymentStatusService = async (paymentId, status) => {
//   const payment = await paymentsModel.getPaymentByPaymentId(paymentId);
//   if (!payment) {
//     const db = await knexInstance();
//     await db('company_payments').insert({ payment_id: paymentId, status });
//     return;
//   }
//   return paymentsModel.updatePaymentByPaymentId(paymentId, status);
// };

// const getAllPaymentsService = async () => {
//   return paymentsModel.getAllPaymentsModel();
// };

// const getPaymentByCompanyService = async (company_id) => {
//   return paymentsModel.getPaymentByCompanyModel(company_id);
// };

const mercadoPagoService = {
  createPayment: async (body_payment) => {
    // Implementar a criação de pagamento com Mercado Pago
  },
  updatePaymentStatus: async (paymentId, status) => {
    // Implementar a atualização do status de pagamento com Mercado Pago
  },
  getAllPayments: async () => {
    // Implementar a listagem de todos os pagamentos com Mercado Pago
  },
  getPaymentByCompany: async (company_id) => {
    // Implementar a listagem de pagamentos de uma empresa específica com Mercado Pago
  },
  getCompanyService: async (company_id) => {
    // Implementar a busca de dados da empresa com Mercado Pago
    const company = await paymentsModel.getCompanyModel(company_id);
    return company;
  },
  getPackageService: async (package_id) => {
    // Implementar a busca de dados do pacote com Mercado Pago
    const package_ = await paymentsModel.getPackageModel(package_id);
    return package_;
  },
  getAddressService: async (address_id) => {
    // Implementar a busca de dados do endereço com Mercado Pago
    const address = await paymentsModel.getAddressModel(address_id);
    return address;
  },
  getStateService: async (address_id) => {
    // Implementar a busca de dados do estado com Mercado Pago
    const state = await paymentsModel.getStateModel(address_id);
    return state;
  },
}


module.exports = mercadoPagoService;
