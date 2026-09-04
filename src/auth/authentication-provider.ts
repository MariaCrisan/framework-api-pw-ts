import type { LoginResponse } from '../models/responses/login-response';
import type { AuthClient } from '../clients/auth-client';
import type { FrameworkConfig } from '../config/config';
import { parseJsonSafely } from '../utils/serialization';
import type { Token } from './token-manager';

export interface AuthenticationProvider { authenticate(): Promise<Token>; }

/** Placeholder bearer-token provider; map field names/endpoints to the real contract in config before enabling auth. */
export class BearerTokenAuthenticationProvider implements AuthenticationProvider {
  constructor(private readonly authClient: AuthClient, private readonly config: FrameworkConfig) {}
  async authenticate(): Promise<Token> {
    const { username, password } = this.config.credentials;
    if (!username || !password) throw new Error('API_USERNAME and API_PASSWORD are required for authenticated scenarios.');
    const result = await this.authClient.login({ username, password });
    if (!result.response.ok()) throw new Error(`Authentication failed with status ${result.response.status()}.`);
    const body = parseJsonSafely(await result.response.text()) as Partial<LoginResponse> | undefined;
    const accessToken = body?.[this.config.auth.tokenField as keyof LoginResponse];
    if (typeof accessToken !== 'string' || !accessToken) throw new Error(`Login response did not include configured token field '${this.config.auth.tokenField}'.`);
    return { accessToken, tokenType: body?.tokenType ?? this.config.auth.tokenType, expiresAt: body?.expiresIn ? Date.now() + body.expiresIn * 1000 : undefined, refreshToken: body?.refreshToken };
  }
}
