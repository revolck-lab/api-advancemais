const paymentValidation = require('../validators/paymentValidator');
const { MercadoPagoConfig, Payment, User } = require('mercadopago');
const mercadoPagoService = require('../services/paymentsService');

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
});

const mercadopagoController = {
  createPaymentController: async (req, res) => {
    try {
      const { company_id, package_id, payment_method, card_token, installments, issuer_id } = req.body;

      if (!company_id || !package_id || !payment_method) {
        return res.status(400).json({ error: "Campos obrigatórios não preenchidos!" });
      }

      // 🔹 Buscar empresa, pacote e endereço
      const company = await mercadoPagoService.getCompanyService(company_id);
      if (!company) return res.status(404).json({ error: "Empresa não encontrada!" });

      const package = await mercadoPagoService.getPackageService(package_id);
      if (!package) return res.status(404).json({ error: "Pacote não encontrado!" });

      const address = await mercadoPagoService.getAddressService(company.address_id);
      if (!address) return res.status(404).json({ error: "Endereço da empresa não encontrado!" });

      const state = await mercadoPagoService.getStateService(company.address_id);
      if (!state) return res.status(404).json({ error: "Estado da empresa não encontrado!" });

      // �� Validar dados do pagamento
      const payment = new Payment(client);
      let paymentData = {
        transaction_amount: parseFloat(package.price),
        description: `Pacote: ${package.name}`,
        payment_method_id: payment_method,
        payer: {
          email: company.email,
          first_name: company.trade_name,
          last_name: company.business_name, // Corrigido
          identification: {  // 🔹 Correção aqui
            type: company.cnpj.length === 14 ? "CNPJ" : null, // 🔹 Definir corretamente
            number: company.cnpj
          },
          address: {
            street_name: address.address,
            street_number: address.number,
            neighborhood: address.address, // Adiciona um valor padrão se não existir no BD
            city: address.city,
            federal_unit: state.federal_unit, // Certifique-se de que o campo armazena siglas como "SP", "RJ"
            zip_code: address.cep,
          }
        }
      };

      console.log(paymentData)

      // 🔹 Pagamento via cartão de crédito
      if (payment_method === 'credit_card') {
        if (!card_token || !installments || !issuer_id) {
          return res.status(400).json({ error: "Dados do cartão são obrigatórios!" });
        }

        paymentData.token = card_token;
        paymentData.installments = parseInt(installments);
        paymentData.issuer_id = issuer_id;
      }

      // 🔹 Pagamento via boleto
      if (payment_method === 'bolbradesco') {
        paymentData.payment_method_id = 'bolbradesco';
      }

      const response = await payment.create({ body: paymentData });

      return res.status(201).json(response);
    } catch (error) {
      console.error("Erro ao criar pagamento:", error);
      return res.status(500).json({ error: error.message || 'Erro ao processar pagamento' });
    }
  },

  getUseMercadoPago: async (req, res) => {
    try {
      const user = new User(client);
      const response = await user.get();
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
};

module.exports = mercadopagoController;
