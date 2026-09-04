import type { APIRequestContext, APIResponse } from '@playwright/test';
import { test as base } from 'playwright-bdd';
import { AuthManager } from '../auth/auth-manager';
import { TokenManager } from '../auth/token-manager';
import { AuthClient } from '../clients/auth-client';
import { BaseApiClient, type ApiRequestOptions } from '../clients/base-api-client';
import { ExampleClient } from '../clients/example-client';
import { UserClient } from '../clients/user-client';
import { config } from '../config/config';

type ApiFixtures = {
  apiClient: BaseApiClient;
  authClient: AuthClient;
  authManager: AuthManager;
  userClient: UserClient;
  exampleClient: ExampleClient;
  authenticatedClient: AuthenticatedApiClient;
  apiScenario: ApiScenario;
};

/** Mutable only within one generated BDD scenario; never shared between tests/workers. */
export class ApiScenario {
  response?: APIResponse;
}

/** Defers token acquisition until a request is made, so BDD Given steps can skip safely. */
export class AuthenticatedApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly authManager: AuthManager
  ) {}

  private async client(): Promise<BaseApiClient> {
    return new BaseApiClient(this.request, config, await this.authManager.getAuthenticationProvider());
  }

  async get<T>(path: string, options?: ApiRequestOptions) { return (await this.client()).get<T>(path, options); }
  async post<T>(path: string, options?: ApiRequestOptions) { return (await this.client()).post<T>(path, options); }
  async put<T>(path: string, options?: ApiRequestOptions) { return (await this.client()).put<T>(path, options); }
  async patch<T>(path: string, options?: ApiRequestOptions) { return (await this.client()).patch<T>(path, options); }
  async delete<T>(path: string, options?: ApiRequestOptions) { return (await this.client()).delete<T>(path, options); }
}

export const test = base.extend<ApiFixtures>({
  apiClient: async ({ request }, use) => use(new BaseApiClient(request)),
  authClient: async ({ request }, use) => use(new AuthClient(request)),
  authManager: async ({ authClient }, use) => use(new AuthManager(authClient, new TokenManager())),
  userClient: async ({ request }, use) => use(new UserClient(request)),
  exampleClient: async ({ request }, use) => use(new ExampleClient(request)),
  authenticatedClient: async ({ request, authManager }, use) => {
    await use(new AuthenticatedApiClient(request, authManager));
  },
  apiScenario: async ({}, use) => use(new ApiScenario())
});

export { expect } from '@playwright/test';
