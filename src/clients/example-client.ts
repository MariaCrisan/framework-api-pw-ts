import type { FrameworkConfig } from '../config/config';
import type { ApiResult, BaseApiClient } from './base-api-client';

export class ExampleClient {
  constructor(private readonly api: BaseApiClient, private readonly config: FrameworkConfig) {}
  checkHealth(): Promise<ApiResult> { return this.api.get(this.config.endpoints.health); }
  getProtectedResource(): Promise<ApiResult> { return this.api.get(this.config.endpoints.protectedResource); }
}
