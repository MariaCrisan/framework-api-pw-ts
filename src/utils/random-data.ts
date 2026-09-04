export function randomString(length = 12): string {
  return Math.random().toString(36).slice(2, 2 + length);
}

export function randomEmail(): string { return `api-test-${randomString(10)}@example.test`; }
export function randomUsername(): string { return `api_test_${randomString(10)}`; }
