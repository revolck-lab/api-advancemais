// src/shared/utils/cache/memory-cache.ts

import { ICache } from "./cache.interface";

/**
 * Item de cache com metadados
 */
interface CacheItem<T> {
  value: T;
  expiresAt: number | null;
}

/**
 * Implementação de cache em memória
 * Útil para desenvolvimento e ambientes de teste
 */
export class MemoryCache implements ICache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultTtl: number | null;

  /**
   * Construtor do cache em memória
   * @param defaultTtl Tempo de vida padrão em segundos (null para não expirar)
   * @param cleanupInterval Intervalo de limpeza de itens expirados em ms (0 para desabilitar)
   */
  constructor(
    defaultTtl: number | null = 3600,
    cleanupInterval: number = 60000
  ) {
    this.defaultTtl = defaultTtl;

    // Configurar limpeza periódica de itens expirados
    if (cleanupInterval > 0) {
      setInterval(() => this.removeExpiredItems(), cleanupInterval);
    }
  }

  /**
   * Armazena um valor no cache
   * @param key Chave para identificação do valor
   * @param value Valor a ser armazenado
   * @param ttl Tempo de vida em segundos (usa o padrão se não fornecido)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const expiresAt = this.calculateExpiration(ttl);
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Recupera um valor do cache
   * @param key Chave do valor
   * @returns Valor armazenado ou null se não encontrado ou expirado
   */
  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Verificar se o item expirou
    if (item.expiresAt && item.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  /**
   * Verifica se uma chave existe e não está expirada no cache
   * @param key Chave a ser verificada
   * @returns true se a chave existir e não estiver expirada
   */
  async has(key: string): Promise<boolean> {
    const item = this.cache.get(key);

    if (!item) {
      return false;
    }

    // Verificar se o item expirou
    if (item.expiresAt && item.expiresAt < Date.now()) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove um valor do cache
   * @param key Chave a ser removida
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  /**
   * Limpa todo o cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
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
   * Remove itens expirados do cache
   * @returns Número de itens removidos
   */
  private removeExpiredItems(): number {
    const now = Date.now();
    let removedCount = 0;

    this.cache.forEach((item, key) => {
      if (item.expiresAt && item.expiresAt < now) {
        this.cache.delete(key);
        removedCount++;
      }
    });

    return removedCount;
  }

  /**
   * Calcula o timestamp de expiração
   * @param ttl Tempo de vida em segundos
   * @returns Timestamp de expiração ou null para não expirar
   */
  private calculateExpiration(ttl?: number): number | null {
    // Se ttl foi especificado, usar ele
    if (ttl !== undefined) {
      return ttl > 0 ? Date.now() + ttl * 1000 : null;
    }

    // Caso contrário, usar o ttl padrão
    return this.defaultTtl !== null
      ? Date.now() + this.defaultTtl * 1000
      : null;
  }
}
