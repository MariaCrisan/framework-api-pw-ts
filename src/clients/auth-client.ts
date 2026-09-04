import type { FrameworkConfig } from '../config/config';
import type { LoginRequest } from '../models/requests/login-request';
import type { ApiResult, BaseApiClient } from './base-api-client';

export class AuthClient {
  constructor(private readonly api: BaseApiClient, private readonly config: FrameworkConfig) {}
  login(credentials: LoginRequest): Promise<ApiResult> { return this.api.post(this.config.endpoints.login, credentials); }
}
