// src/shared/utils/cache/cache.interface.ts

/**
 * Interface para implementações de cache
 * Define os métodos básicos que qualquer provedor de cache deve implementar
 */
export interface ICache {
  /**
   * Armazena um valor no cache
   * @param key Chave para identificação do valor
   * @param value Valor a ser armazenado
   * @param ttl Tempo de vida em segundos (opcional)
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Recupera um valor do cache
   * @param key Chave do valor
   * @returns Valor armazenado ou null se não encontrado
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Verifica se uma chave existe no cache
   * @param key Chave a ser verificada
   * @returns true se a chave existir
   */
  has(key: string): Promise<boolean>;

  /**
   * Remove um valor do cache
   * @param key Chave a ser removida
   */
  delete(key: string): Promise<void>;

  /**
   * Limpa todo o cache
   */
  clear(): Promise<void>;

  /**
   * Obtém ou calcula um valor
   * @param key Chave do valor
   * @param factory Função para calcular o valor se não estiver em cache
   * @param ttl Tempo de vida em segundos (opcional)
   * @returns Valor do cache ou calculado
   */
  getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T>;
}


