import { AuthClient } from '../clients/auth-client';
import { getCredentials } from '../config/config';
import type { LoginResponse } from '../models/responses/auth';
import { BearerTokenAuthenticationProvider, type AuthenticationProvider } from './authentication-provider';
import { TokenManager } from './token-manager';

export class AuthenticationError extends Error {}

export class AuthManager {
  constructor(private readonly authClient: AuthClient, private readonly tokens: TokenManager) {}

  async getAuthenticationProvider(): Promise<AuthenticationProvider> {
    const cached = this.tokens.validToken;
    if (cached) return new BearerTokenAuthenticationProvider(cached);

    if (this.tokens.refreshToken) {
      try { return this.storeResponse(await this.authClient.refresh(this.tokens.refreshToken)); }
      catch { this.tokens.clear(); } // Login below produces the useful failure if refresh is unsupported/invalid.
    }
    return this.storeResponse(await this.authClient.login(getCredentials()));
  }

  clear(): void { this.tokens.clear(); }

  private async storeResponse(response: { ok(): boolean; status(): number; json(): Promise<LoginResponse> }): Promise<AuthenticationProvider> {
    if (!response.ok()) throw new AuthenticationError(`Authentication failed with HTTP ${response.status()}.`);
    const body = await response.json();
    const accessToken = body.accessToken ?? body.access_token;
    if (!accessToken) throw new AuthenticationError('Authentication succeeded but the response has no access token. Update LoginResponse for this API contract.');
    this.tokens.set(accessToken, body.expiresIn ?? body.expires_in, body.refreshToken ?? body.refresh_token);
    return new BearerTokenAuthenticationProvider(accessToken);
  }
}
