import { expect } from '@playwright/test';
export const expectDefined = (value: unknown, name: string) => expect(value, `${name} should be defined`).toBeTruthy();
