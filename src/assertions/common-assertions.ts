import { expect } from '@playwright/test';

export function expectDefined<T>(value: T | undefined | null, label: string): asserts value is T {
  expect(value, `${label} should be defined`).toBeTruthy();
}
