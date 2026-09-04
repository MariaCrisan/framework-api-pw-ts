import type { AuthClient } from '../clients/auth-client';
import type { FrameworkConfig } from '../config/config';
import type { TokenManager } from './token-manager';
import { BearerTokenAuthenticationProvider } from './authentication-provider';
import { invalidCredentials } from '../test-data/test-data';

export class AuthManager {
  constructor(private readonly authClient: AuthClient, private readonly tokens: TokenManager, private readonly config: FrameworkConfig) {}
  async authenticateWithValidCredentials(): Promise<string> {
    const cached = this.tokens.accessToken();
    if (cached) return cached;
    const token = await new BearerTokenAuthenticationProvider(this.authClient, this.config).authenticate();
    this.tokens.set(token);
    return token.accessToken;
  }
  async authenticateWithInvalidCredentials() { return this.authClient.login(invalidCredentials); }
  clearAuthentication(): void { this.tokens.clear(); }
}
