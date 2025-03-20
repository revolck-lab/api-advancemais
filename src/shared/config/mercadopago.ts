import mercadopago from 'mercadopago';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Configuração do SDK do Mercado Pago
 * Inicializa o SDK com as credenciais configuradas no ambiente
 */
export const initMercadoPago = (): void => {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    
    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado nas variáveis de ambiente');
    }
    
    // Configura o SDK com o access token
    mercadopago.configure({
      access_token: accessToken
    });
    
    console.log('✅ Mercado Pago SDK configurado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao configurar Mercado Pago SDK:', error);
    throw error;
  }
};

/**
 * Retorna a instância configurada do SDK do Mercado Pago
 */
export const getMercadoPagoInstance = (): typeof mercadopago => {
  return mercadopago;
};

/**
 * Verifica se a assinatura do webhook é válida
 * @param signature Assinatura recebida no header
 * @param data Dados recebidos no corpo da requisição 
 * @returns boolean Indica se a assinatura é válida
 */
export const isWebhookSignatureValid = (signature: string, data: any): boolean => {
  try {
    // Implementar verificação de assinatura com a assinatura secreta
    // Esta é uma implementação simplificada para fins de exemplo
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    
    if (!secret) {
      console.warn('⚠️ MERCADOPAGO_WEBHOOK_SECRET não configurado nas variáveis de ambiente');
      return false;
    }
    
    // Aqui você deve implementar a lógica de verificação específica do Mercado Pago
    // Verificar a documentação para detalhes: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/webhooks/webhooks
    
    return true; // Substitua por uma validação real
  } catch (error) {
    console.error('❌ Erro ao validar assinatura de webhook:', error);
    return false;
  }
};

export default {
  initMercadoPago,
  getMercadoPagoInstance,
  isWebhookSignatureValid
};