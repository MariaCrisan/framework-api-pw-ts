import type { APIResponse } from '@playwright/test';
import { test as base } from 'playwright-bdd';
import { AuthManager } from '../auth/auth-manager';
import { TokenManager } from '../auth/token-manager';
import { AuthClient } from '../clients/auth-client';
import { BaseApiClient } from '../clients/base-api-client';
import { ExampleClient } from '../clients/example-client';
import { UserClient } from '../clients/user-client';
import { config } from '../config/config';

type ApiFixtures = {
  apiClient: BaseApiClient;
  authClient: AuthClient;
  authManager: AuthManager;
  userClient: UserClient;
  exampleClient: ExampleClient;
  authenticatedClient: BaseApiClient;
  apiScenario: ApiScenario;
};

/** Mutable only within one generated BDD scenario; never shared between tests/workers. */
export class ApiScenario {
  response?: APIResponse;
}

export const test = base.extend<ApiFixtures>({
  apiClient: async ({ request }, use) => use(new BaseApiClient(request)),
  authClient: async ({ request }, use) => use(new AuthClient(request)),
  authManager: async ({ authClient }, use) => use(new AuthManager(authClient, new TokenManager())),
  userClient: async ({ request }, use) => use(new UserClient(request)),
  exampleClient: async ({ request }, use) => use(new ExampleClient(request)),
  authenticatedClient: async ({ request, authManager }, use) => {
    const provider = await authManager.getAuthenticationProvider();
    await use(new BaseApiClient(request, config, provider));
  },
  apiScenario: async ({}, use) => use(new ApiScenario())
});

export { expect } from '@playwright/test';
