import { SignJWT } from "jose";
import { UserPayload } from "@shared/interfaces/auth.interface";

/**
 * Utilitário para geração e validação de tokens JWT
 * Centraliza toda a lógica relacionada a tokens de autenticação
 */
export class TokenUtils {
  private tokenExpiresIn: number;
  private jwtSecret: Uint8Array;

  /**
   * Construtor do utilitário de tokens
   * @param jwtSecret Chave secreta para assinatura JWT
   * @param expiresIn Tempo de expiração em segundos (padrão: 8 horas)
   */
  constructor(jwtSecret: string, expiresIn: number = 8 * 60 * 60) {
    this.jwtSecret = new TextEncoder().encode(jwtSecret);
    this.tokenExpiresIn = expiresIn;
  }

  /**
   * Gera um token JWT para o usuário ou empresa
   * @param payload Dados para inclusão no token (sem timestamps)
   * @returns Token JWT assinado e tempo de expiração
   */
  async generateToken(
    payload: Omit<UserPayload, "iat" | "exp">
  ): Promise<{ token: string; expiresIn: number }> {
    // Adiciona os timestamps ao payload
    const now = Math.floor(Date.now() / 1000);
    const expiration = now + this.tokenExpiresIn;

    const fullPayload: UserPayload = {
      ...payload,
      iat: now,
      exp: expiration,
    };

    // Cria e assina o token
    const token = await new SignJWT({ ...fullPayload })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(expiration) // Passamos o valor direto, sem usar o campo do payload
      .setIssuedAt(now) // Passamos o valor direto, sem usar o campo do payload
      .setNotBefore(now) // Passamos o valor direto, sem usar o campo do payload
      .sign(this.jwtSecret);

    return { token, expiresIn: this.tokenExpiresIn };
  }
}
