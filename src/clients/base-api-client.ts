import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { FrameworkConfig } from '../config/config';
import type { Logger } from '../utils/logger';
import { safeJson } from '../utils/masking';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export interface RequestOptions { headers?: Record<string, string>; data?: unknown; params?: Record<string, string | number | boolean>; }
export interface ApiResult { response: APIResponse; method: HttpMethod; endpoint: string; requestId: string; durationMs: number; }

export class BaseApiClient {
  constructor(
    private readonly request: APIRequestContext,
    protected readonly config: FrameworkConfig,
    private readonly logger: Logger,
    private readonly token?: string,
  ) {}

  get(endpoint: string, options?: Omit<RequestOptions, 'data'>): Promise<ApiResult> { return this.send('GET', endpoint, options); }
  post(endpoint: string, data?: unknown, options?: Omit<RequestOptions, 'data'>): Promise<ApiResult> { return this.send('POST', endpoint, { ...options, data }); }
  put(endpoint: string, data?: unknown, options?: Omit<RequestOptions, 'data'>): Promise<ApiResult> { return this.send('PUT', endpoint, { ...options, data }); }
  patch(endpoint: string, data?: unknown, options?: Omit<RequestOptions, 'data'>): Promise<ApiResult> { return this.send('PATCH', endpoint, { ...options, data }); }
  delete(endpoint: string, options?: Omit<RequestOptions, 'data'>): Promise<ApiResult> { return this.send('DELETE', endpoint, options); }

  private async send(method: HttpMethod, endpoint: string, options: RequestOptions = {}): Promise<ApiResult> {
    const requestId = crypto.randomUUID();
    const headers = { accept: 'application/json', 'content-type': 'application/json', 'x-request-id': requestId, ...this.token ? { authorization: `${this.config.auth.tokenType} ${this.token}` } : {}, ...options.headers };
    const start = performance.now();
    this.logger.log('debug', 'API request', { method, endpoint, requestId, headers, data: options.data });
    try {
      const response = await this.request.fetch(endpoint, { method, headers, data: options.data, params: options.params, timeout: this.config.timeout, failOnStatusCode: false });
      const durationMs = Math.round(performance.now() - start);
      this.logger.log(response.ok() ? 'info' : 'warn', 'API response', { method, endpoint, requestId, status: response.status(), durationMs });
      return { response, method, endpoint, requestId, durationMs };
    } catch (error) {
      this.logger.log('error', 'API request failed', { method, endpoint, requestId, durationMs: Math.round(performance.now() - start), error: error instanceof Error ? error.message : safeJson(error) });
      throw new Error(`API ${method} ${endpoint} failed (request ID ${requestId}): ${error instanceof Error ? error.message : 'unknown network error'}`);
    }
  }
}
