const sensitiveKey = /authorization|access[_-]?token|refresh[_-]?token|client[_-]?secret|password|api[_-]?key/i;

export function maskValue(value: unknown): unknown {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(maskValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, sensitiveKey.test(key) ? '***MASKED***' : maskValue(item)]));
  }
  return value;
}

export function safeJson(value: unknown): string {
  try { return JSON.stringify(maskValue(value)); } catch { return '[unserializable value]'; }
}
