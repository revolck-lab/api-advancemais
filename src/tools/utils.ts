/**
 * Analisa uma string de conexão MySQL e retorna seus componentes
 * @param connectionString String de conexão no formato mysql://usuario:senha@host:porta/banco
 * @returns Objeto com os componentes da string de conexão
 */
export function parseConnectionString(connectionString: string): {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    protocol: string;
  } {
    try {
      const url = new URL(connectionString);
      const protocol = url.protocol.replace(':', '');
      
      if (!['mysql', 'mariadb', 'postgres', 'postgresql'].includes(protocol)) {
        throw new Error(`Protocolo não suportado: ${protocol}`);
      }
      
      const user = decodeURIComponent(url.username);
      const password = decodeURIComponent(url.password);
      const host = url.hostname;
      
      // Determinar a porta padrão com base no protocolo
      let defaultPort = 3306; // MySQL/MariaDB
      if (protocol === 'postgres' || protocol === 'postgresql') {
        defaultPort = 5432;
      }
      
      const port = url.port ? parseInt(url.port, 10) : defaultPort;
      
      // Remover a barra inicial do pathname
      let database = url.pathname.substring(1);
      
      // Lidar com parâmetros de consulta (se houver)
      const params: Record<string, string> = {};
      for (const [key, value] of url.searchParams.entries()) {
        params[key] = value;
      }
      
      return { 
        protocol,
        host, 
        port, 
        user, 
        password, 
        database,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erro ao analisar string de conexão: ${error.message}`);
      }
      throw new Error('Erro desconhecido ao analisar string de conexão');
    }
  }
  
  /**
   * Mascara uma string de conexão para exibição segura
   * @param connectionString String de conexão original
   * @returns String de conexão com a senha oculta
   */
  export function maskConnectionString(connectionString: string): string {
    try {
      const parsed = parseConnectionString(connectionString);
      return `${parsed.protocol}://${parsed.user}:****@${parsed.host}:${parsed.port}/${parsed.database}`;
    } catch (error) {
      return 'String de conexão inválida';
    }
  }
  
  /**
   * Verifica se uma string é uma URL válida
   * @param str String a ser verificada
   * @returns true se for uma URL válida, false caso contrário
   */
  export function isValidUrl(str: string): boolean {
    try {
      new URL(str);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Constrói uma string de conexão a partir de seus componentes
   * @param config Configuração de conexão
   * @returns String de conexão formatada
   */
  export function buildConnectionString(config: {
    protocol: string;
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    params?: Record<string, string>;
  }): string {
    const { protocol, host, port, user, password, database, params = {} } = config;
    
    // Codificar usuário e senha para lidar com caracteres especiais
    const encodedUser = encodeURIComponent(user);
    const encodedPassword = encodeURIComponent(password);
    
    // Construir a URL base
    let connectionString = `${protocol}://${encodedUser}:${encodedPassword}@${host}:${port}/${database}`;
    
    // Adicionar parâmetros, se houver
    if (Object.keys(params).length > 0) {
      const queryParams = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      
      connectionString += `?${queryParams}`;
    }
    
    return connectionString;
  }