export const randomString = (length = 10): string => Math.random().toString(36).slice(2, 2 + length);
export const randomEmail = (): string => `api-test-${randomString(12)}@example.test`;
export const randomUsername = (): string => `user_${randomString(10)}`;
