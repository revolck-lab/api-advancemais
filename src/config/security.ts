import { SignJWT, jwtVerify, JWTVerifyResult } from "jose";
import { hash, compare } from "bcrypt";
import { UserPayload } from "@/shared/interfaces/auth.interface";

/**
 * Classe para gerenciar funcionalidades de segurança
 */
export class Security {
  private static instance: Security;
  private jwtSecret: Uint8Array;
  private saltRounds: number;

  /**
   * Construtor privado para implementação do padrão Singleton
   */
  private constructor() {
    // Inicializar a chave secreta do JWT
    this.jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET || "");

    // Definir o número de rounds de salt para o bcrypt
    this.saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
  }

  /**
   * Retorna a instância única de segurança
   */
  public static getInstance(): Security {
    if (!Security.instance) {
      Security.instance = new Security();
    }
    return Security.instance;
  }

  /**
   * Gera um token JWT para o usuário
   * @param payload Dados do usuário para incluir no token
   * @returns Token JWT assinado
   */
  public async generateToken(payload: UserPayload): Promise<string> {
    // Adiciona a data de expiração ao payload
    const now = Math.floor(Date.now() / 1000);
    payload.iat = now;

    // Converter a string de expiração (ex: "1d") para segundos
    const expiresIn = this.parseJwtExpiration(
      process.env.JWT_EXPIRES_IN || "1d"
    );
    payload.exp = now + expiresIn;

    // Cria e assina o token
    const token = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(payload.exp)
      .setIssuedAt(payload.iat)
      .setNotBefore(payload.iat)
      .sign(this.jwtSecret);

    return token;
  }

  /**
   * Verifica e decodifica um token JWT
   * @param token Token JWT
   * @returns Payload decodificado ou null se inválido
   */
  public async verifyToken(token: string): Promise<UserPayload | null> {
    try {
      const { payload } = (await jwtVerify(
        token,
        this.jwtSecret
      )) as JWTVerifyResult & { payload: UserPayload };

      return payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Gera um hash para uma senha
   * @param password Senha em texto plano
   * @returns Hash da senha
   */
  public async hashPassword(password: string): Promise<string> {
    return hash(password, this.saltRounds);
  }

  /**
   * Verifica se uma senha corresponde ao hash armazenado
   * @param password Senha em texto plano
   * @param hashedPassword Hash armazenado
   * @returns true se a senha corresponder ao hash
   */
  public async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return compare(password, hashedPassword);
  }

  /**
   * Converte uma string de expiração JWT (1d, 7d, 60m, etc.) para segundos
   * @param expiration String de expiração
   * @returns Tempo de expiração em segundos
   */
  private parseJwtExpiration(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhdw])$/);

    if (!match) {
      // Valor padrão: 8 horas
      return 8 * 60 * 60;
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case "s": // segundos
        return value;
      case "m": // minutos
        return value * 60;
      case "h": // horas
        return value * 60 * 60;
      case "d": // dias
        return value * 24 * 60 * 60;
      case "w": // semanas
        return value * 7 * 24 * 60 * 60;
      default:
        return 8 * 60 * 60; // 8 horas
    }
  }
}

export const security = Security.getInstance();
