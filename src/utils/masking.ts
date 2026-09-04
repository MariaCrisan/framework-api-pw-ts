const SENSITIVE_KEYS = new Set([
  'authorization', 'cookie', 'set-cookie', 'password', 'clientsecret',
  'accesstoken', 'refreshtoken', 'apikey', 'token'
]);

export function maskSensitive(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(maskSensitive);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [
      key,
      SENSITIVE_KEYS.has(key.toLowerCase()) ? '[REDACTED]' : maskSensitive(entry)
    ]));
  }
  return value;
}

export function maskText(value: string): string {
  return value.replace(/(authorization|password|clientSecret|accessToken|refreshToken|apiKey)(["'=:\s]+)([^,\s"'}]+)/gi, '$1$2[REDACTED]');
}
