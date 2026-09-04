import { expect, type APIResponse } from '@playwright/test';
import { safeResponseBody } from '../utils/serialization';

async function diagnostic(response: APIResponse, expected: string): Promise<string> {
  return `${expected}\nActual status: ${response.status()}\nURL: ${response.url()}\nResponse body: ${await safeResponseBody(response)}`;
}

export async function expectStatus(response: APIResponse, expected: number): Promise<void> {
  expect(response.status(), await diagnostic(response, `Expected status: ${expected}`)).toBe(expected);
}

export async function expectSuccess(response: APIResponse): Promise<void> {
  expect(response.ok(), await diagnostic(response, 'Expected a successful (2xx) response')).toBeTruthy();
}

export async function expectUnauthorized(response: APIResponse, status = 401): Promise<void> { await expectStatus(response, status); }
export async function expectBadRequest(response: APIResponse): Promise<void> { await expectStatus(response, 400); }

export async function expectJsonResponse(response: APIResponse): Promise<Record<string, unknown> | unknown[]> {
  expect(response.headers()['content-type'] ?? '', 'Expected a JSON Content-Type header').toContain('application/json');
  try { return await response.json() as Record<string, unknown> | unknown[]; }
  catch { throw new Error(`Expected valid JSON. ${await diagnostic(response, '')}`); }
}

export async function expectResponseContains(response: APIResponse, property: string): Promise<void> {
  const body = await expectJsonResponse(response);
  expect(
    !Array.isArray(body) && Object.prototype.hasOwnProperty.call(body, property),
    `Expected response to contain "${property}"`
  ).toBeTruthy();
}

export function expectResponseTimeBelow(response: APIResponse, milliseconds: number): void {
  expect(response.timing().responseEnd, `Expected response time below ${milliseconds}ms`).toBeLessThan(milliseconds);
}
