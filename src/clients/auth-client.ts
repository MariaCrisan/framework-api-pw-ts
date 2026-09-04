import { BaseApiClient } from './base-api-client';
import type { LoginRequest, RefreshTokenRequest } from '../models/requests/auth';
import type { LoginResponse } from '../models/responses/auth';
import type { TypedApiResponse } from '../models/responses/api-response';

export class AuthClient extends BaseApiClient {
  login(credentials: LoginRequest): Promise<TypedApiResponse<LoginResponse>> {
    return this.post(this.frameworkConfig.auth.loginPath, { data: credentials });
  }
  refresh(refreshToken: string): Promise<TypedApiResponse<LoginResponse>> {
    if (!this.frameworkConfig.auth.refreshPath) throw new Error('No auth.refreshPath is configured.');
    const data: RefreshTokenRequest = { refreshToken };
    return this.post(this.frameworkConfig.auth.refreshPath, { data });
  }
}
