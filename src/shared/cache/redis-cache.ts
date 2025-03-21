// src/shared/utils/cache/redis-cache.ts

import { ICache } from "./cache.interface";
import { createClient, RedisClientType } from "redis";
import { ErrorLogger } from "../error-logger";

const logger = ErrorLogger.getInstance();

/**
 * Implementação de cache usando Redis
 * Recomendado para ambientes de produção e distribuídos
 */
export class RedisCache implements ICache {
  private client: RedisClientType;
  private isConnected: boolean = false;
  private defaultTtl: number | null;
  private prefix: string;

  /**
   * Construtor do cache Redis
   * @param connectionString String de conexão com o Redis
   * @param defaultTtl Tempo de vida padrão em segundos (null para não expirar)
   * @param prefix Prefixo para as chaves (útil para separar ambientes)
   */
  constructor(
    connectionString: string = process.env.REDIS_URL ||
      "redis://localhost:6379",
    defaultTtl: number | null = 3600,
    prefix: string = "app:"
  ) {
    this.defaultTtl = defaultTtl;
    this.prefix = prefix;

    // Criar cliente Redis
    this.client = createClient({
      url: connectionString,
    });

    // Configurar handlers de eventos
    this.client.on("error", (err) => {
      logger.logError(err, "RedisCache", { connectionString });
      this.isConnected = false;
    });

    this.client.on("connect", () => {
      logger.logInfo("Conectado ao Redis com sucesso", "RedisCache");
      this.isConnected = true;
    });

    // Conectar automaticamente
    this.connect();
  }

  /**
   * Conecta ao servidor Redis
   */
  private async connect(): Promise<void> {
    if (!this.isConnected) {
      try {
        await this.client.connect();
      } catch (error) {
        logger.logError(error as Error, "RedisCache.connect");
        throw error;
      }
    }
  }

  /**
   * Formata uma chave adicionando o prefixo
   * @param key Chave original
   * @returns Chave com prefixo
   */
  private formatKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Armazena um valor no cache
   * @param key Chave para identificação do valor
   * @param value Valor a ser armazenado
   * @param ttl Tempo de vida em segundos (usa o padrão se não fornecido)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.ensureConnection();

    const formattedKey = this.formatKey(key);
    const serializedValue = JSON.stringify(value);

    // Definir TTL específico ou usar o padrão
    const effectiveTtl = ttl !== undefined ? ttl : this.defaultTtl;

    if (effectiveTtl !== null && effectiveTtl > 0) {
      await this.client.setEx(formattedKey, effectiveTtl, serializedValue);
    } else {
      await this.client.set(formattedKey, serializedValue);
    }
  }

  /**
   * Recupera um valor do cache
   * @param key Chave do valor
   * @returns Valor armazenado ou null se não encontrado
   */
  async get<T>(key: string): Promise<T | null> {
    await this.ensureConnection();

    const formattedKey = this.formatKey(key);
    const value = await this.client.get(formattedKey);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      logger.logError(error as Error, "RedisCache.get", { key });
      return null;
    }
  }

  /**
   * Verifica se uma chave existe no cache
   * @param key Chave a ser verificada
   * @returns true se a chave existir
   */
  async has(key: string): Promise<boolean> {
    await this.ensureConnection();

    const formattedKey = this.formatKey(key);
    const exists = await this.client.exists(formattedKey);

    return exists > 0;
  }

  /**
   * Remove um valor do cache
   * @param key Chave a ser removida
   */
  async delete(key: string): Promise<void> {
    await this.ensureConnection();

    const formattedKey = this.formatKey(key);
    await this.client.del(formattedKey);
  }

  /**
   * Limpa todo o cache que corresponde ao prefixo
   */
  async clear(): Promise<void> {
    await this.ensureConnection();

    // Buscar todas as chaves com o prefixo
    const keys = await this.client.keys(`${this.prefix}*`);

    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }

  /**
   * Obtém um valor do cache ou executa a factory para criá-lo
   * @param key Chave do valor
   * @param factory Função para calcular o valor se não estiver em cache
   * @param ttl Tempo de vida em segundos (opcional)
   * @returns Valor do cache ou calculado
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    await this.ensureConnection();

    // Tentar obter do cache
    const cachedValue = await this.get<T>(key);

    if (cachedValue !== null) {
      return cachedValue;
    }

    // Executar factory para obter o valor
    const value = await factory();

    // Armazenar no cache
    await this.set(key, value, ttl);

    return value;
  }

  /**
   * Garante que há uma conexão com o Redis
   */
  private async ensureConnection(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }
  }

  /**
   * Fecha a conexão com o Redis
   */
  async close(): Promise<void> {
    if (this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}
