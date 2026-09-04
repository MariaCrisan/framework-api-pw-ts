import type { APIResponse } from '@playwright/test';

export type TypedApiResponse<T> = APIResponse & { json(): Promise<T> };

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  code?: string;
  [key: string]: unknown;
}
