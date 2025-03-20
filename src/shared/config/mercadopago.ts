import { MercadoPagoConfig } from 'mercadopago';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Cria e retorna uma instância configurada do cliente Mercado Pago
 * Adaptado para a versão 2.3.0 do SDK
 * @returns Instância configurada do MercadoPagoConfig
 */
export const createMercadoPagoClient = (): MercadoPagoConfig => {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    
    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado nas variáveis de ambiente');
    }
    
    // Configurar o cliente com o access token - adaptado para SDK 2.3.0
    const client = new MercadoPagoConfig({
      accessToken: accessToken
    });
    
    console.log('✅ Mercado Pago SDK configurado com sucesso');
    return client;
  } catch (error) {
    console.error('❌ Erro ao configurar Mercado Pago SDK:', error);
    throw error;
  }
};

/**
 * Verifica se a assinatura do webhook é válida
 * @param signature Assinatura recebida no header
 * @param data Dados recebidos no corpo da requisição 
 * @returns boolean Indica se a assinatura é válida
 */
export const isWebhookSignatureValid = (signature: string, data: any): boolean => {
  try {
    // Implementação de verificação da assinatura do webhook do Mercado Pago
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.warn('⚠️ MERCADOPAGO_WEBHOOK_SECRET não configurado nas variáveis de ambiente');
      return false;
    }
    
    // Criar o HMAC com SHA256
    const hmac = crypto.createHmac('sha256', webhookSecret);
    
    // Adicionar o payload como string ao HMAC
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    hmac.update(payload);
    
    // Gerar a assinatura esperada
    const expectedSignature = hmac.digest('hex');
    
    // Comparar a assinatura recebida com a esperada de forma segura contra ataques de timing
    return crypto.timingSafeEqual(
      Buffer.from(signature), 
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('❌ Erro ao validar assinatura de webhook:', error);
    return false;
  }
};

export default {
  createMercadoPagoClient,
  isWebhookSignatureValid
};