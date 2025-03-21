/**
 * Interface para parâmetros de paginação
 * Utilizada para padronizar operações que retornem listas paginadas
 */
export interface PaginationParams {
  /** Número da página (começa em 1) */
  page?: number;
  /** Quantidade de itens por página */
  limit?: number;
}

/**
 * Interface para resultado paginado
 * @template T Tipo dos itens na lista
 */
export interface PaginatedResult<T> {
  /** Lista de itens */
  items: T[];
  /** Número total de itens (em todas as páginas) */
  total: number;
  /** Página atual */
  page: number;
  /** Quantidade de itens por página */
  limit: number;
  /** Número total de páginas */
  totalPages: number;
}

/**
 * Interface para filtros base que incluem paginação
 * Extendida por interfaces de filtros específicos
 */
export interface BaseFilters extends PaginationParams {
  /** Ordenação (campo e direção) */
  sortBy?: string;
  /** Direção da ordenação (asc/desc) */
  sortOrder?: "asc" | "desc";
}

/**
 * Interface para resposta padronizada da API
 * @template T Tipo dos dados retornados
 */
export interface ApiResponse<T> {
  /** Status da resposta (success/error) */
  status: "success" | "error";
  /** Mensagem informativa */
  message?: string;
  /** Dados retornados (se houver) */
  data?: T;
  /** Detalhes em caso de erro */
  details?: any;
}

/**
 * Interface para objeto de endereço
 * Reutilizada em várias partes do sistema
 */
export interface AddressDTO {
  /** Nome da rua/avenida */
  address: string;
  /** Cidade */
  city: string;
  /** Estado (sigla) */
  state: string;
  /** CEP (somente números) */
  cep: string;
  /** Número */
  number: number;
}

/**
 * Interface para endereço parcial (atualização)
 */
export interface PartialAddressDTO {
  /** Nome da rua/avenida */
  address?: string;
  /** Cidade */
  city?: string;
  /** Estado (sigla) */
  state?: string;
  /** CEP (somente números) */
  cep?: string;
  /** Número */
  number?: number;
}
