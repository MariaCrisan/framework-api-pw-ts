import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { AuthenticationProvider } from '../auth/authentication-provider';
import { config, type FrameworkConfig } from '../config/config';
import type { TypedApiResponse } from '../models/responses/api-response';
import { logger, type Logger } from '../utils/logger';

export interface ApiRequestOptions {
  data?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
}

export class ApiRequestError extends Error {
  constructor(message: string, public readonly cause?: unknown) { super(message); }
}

export class BaseApiClient {
  constructor(
    protected readonly request: APIRequestContext,
    protected readonly frameworkConfig: Readonly<FrameworkConfig> = config,
    private readonly authentication?: AuthenticationProvider,
    private readonly requestLogger: Logger = logger
  ) {}

  get<T>(path: string, options?: ApiRequestOptions): Promise<TypedApiResponse<T>> { return this.send('GET', path, options); }
  post<T>(path: string, options?: ApiRequestOptions): Promise<TypedApiResponse<T>> { return this.send('POST', path, options); }
  put<T>(path: string, options?: ApiRequestOptions): Promise<TypedApiResponse<T>> { return this.send('PUT', path, options); }
  patch<T>(path: string, options?: ApiRequestOptions): Promise<TypedApiResponse<T>> { return this.send('PATCH', path, options); }
  delete<T>(path: string, options?: ApiRequestOptions): Promise<TypedApiResponse<T>> { return this.send('DELETE', path, options); }

  private async send<T>(method: string, path: string, options: ApiRequestOptions = {}): Promise<TypedApiResponse<T>> {
    const requestId = crypto.randomUUID();
    const headers = this.authentication?.apply({ 'Content-Type': 'application/json', 'X-Request-ID': requestId, ...options.headers })
      ?? { 'Content-Type': 'application/json', 'X-Request-ID': requestId, ...options.headers };
    const startedAt = Date.now();
    this.requestLogger.debug('API request', { method, endpoint: path, requestId });
    try {
      const response = await this.request.fetch(path, {
        method,
        data: options.data,
        headers,
        params: options.params,
        timeout: this.frameworkConfig.timeout,
        failOnStatusCode: false
      });
      this.requestLogger.info('API response', { method, endpoint: path, status: response.status(), durationMs: Date.now() - startedAt, requestId });
      return response as TypedApiResponse<T>;
    } catch (cause) {
      const message = `Unable to connect to API. Environment: ${this.frameworkConfig.environment}; Base URL: ${this.frameworkConfig.baseUrl}; Endpoint: ${path}; Method: ${method}; Timeout: ${this.frameworkConfig.timeout}ms.`;
      this.requestLogger.error(message, { requestId });
      throw new ApiRequestError(message, cause);
    }
  }
}
