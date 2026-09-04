export interface TokenState { accessToken: string; refreshToken?: string; expiresAt: number; }

/** A fixture-owned cache. It is never shared across Playwright workers or tests. */
export class TokenManager {
  private state?: TokenState;
  get validToken(): string | undefined {
    return this.state && this.state.expiresAt > Date.now() + 30_000 ? this.state.accessToken : undefined;
  }
  get refreshToken(): string | undefined { return this.state?.refreshToken; }
  set(accessToken: string, expiresInSeconds?: number, refreshToken?: string): void {
    this.state = { accessToken, refreshToken, expiresAt: Date.now() + (expiresInSeconds ?? 300) * 1000 };
  }
  clear(): void { this.state = undefined; }
}
