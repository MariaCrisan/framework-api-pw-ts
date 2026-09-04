export interface Token { accessToken: string; tokenType: string; expiresAt?: number; refreshToken?: string; }

/** Scenario-scoped token store. It is intentionally never shared between workers. */
export class TokenManager {
  private token?: Token;
  set(token: Token): void { this.token = token; }
  get(): Token | undefined { return this.token; }
  accessToken(): string | undefined { return this.token && (!this.token.expiresAt || this.token.expiresAt > Date.now()) ? this.token.accessToken : undefined; }
  clear(): void { this.token = undefined; }
}
