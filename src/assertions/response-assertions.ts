import { expect, type APIResponse } from '@playwright/test';
import type { ApiResult } from '../clients/base-api-client';
import { parseJsonSafely, serializeForDiagnostics } from '../utils/serialization';

async function diagnostic(result: ApiResult): Promise<string> {
  const body = await result.response.text();
  return `Expected status: 2xx\nActual status: ${result.response.status()}\nMethod: ${result.method}\nEndpoint: ${result.endpoint}\nRequest ID: ${result.requestId}\nResponse body: ${serializeForDiagnostics(parseJsonSafely(body) ?? body)}`;
}

export async function expectSuccess(result: ApiResult): Promise<void> { expect(result.response.ok(), await diagnostic(result)).toBeTruthy(); }
export async function expectStatus(result: ApiResult, status: number): Promise<void> { expect(result.response.status(), await diagnostic(result)).toBe(status); }
export async function expectUnauthorized(result: ApiResult): Promise<void> { await expectStatus(result, 401); }
export async function expectBadRequest(result: ApiResult): Promise<void> { await expectStatus(result, 400); }
export async function expectJsonResponse(response: APIResponse): Promise<unknown> {
  expect(response.headers()['content-type'] ?? '', 'Response is not JSON.').toContain('application/json');
  const text = await response.text();
  const value = parseJsonSafely(text);
  expect(value, 'Response body is not valid JSON.').toBeDefined();
  return value;
}
export async function expectResponseContains(response: APIResponse, property: string): Promise<void> {
  const body = await expectJsonResponse(response);
  expect(body, `Response did not contain '${property}'.`).toHaveProperty(property);
}
