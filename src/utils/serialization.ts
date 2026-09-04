import type { APIResponse } from '@playwright/test';
import { maskSensitive, maskText } from './masking';

export async function safeResponseBody(response: APIResponse): Promise<string> {
  try {
    const text = await response.text();
    try { return JSON.stringify(maskSensitive(JSON.parse(text))); }
    catch { return maskText(text); }
  } catch { return '<response body unavailable>'; }
}

export function safeJson(value: unknown): string {
  try { return JSON.stringify(maskSensitive(value)); }
  catch { return '<unserializable payload>'; }
}
