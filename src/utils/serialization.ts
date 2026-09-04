import { safeJson } from './masking';

export function parseJsonSafely(text: string): unknown {
  try { return JSON.parse(text); } catch { return undefined; }
}
export const serializeForDiagnostics = (value: unknown): string => safeJson(value);
