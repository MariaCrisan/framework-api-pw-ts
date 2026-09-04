import { request as playwrightRequest, type APIRequestContext } from '@playwright/test';
import { test as base } from 'playwright-bdd';
import { AuthManager } from '../auth/auth-manager';
import { TokenManager } from '../auth/token-manager';
import { AuthClient } from '../clients/auth-client';
import { BaseApiClient, type ApiResult } from '../clients/base-api-client';
import { ExampleClient } from '../clients/example-client';
import { type FrameworkConfig } from '../config/config';
import { loadConfiguration } from '../config/config-loader';
import { ConsoleLogger, type Logger } from '../utils/logger';

export interface ScenarioContext {
  lastResult?: ApiResult;
  accessToken?: string;
  requestId?: string;
  testData: Record<string, unknown>;
}

type ApiFixtures = {
  configuration: FrameworkConfig;
  apiRequest: APIRequestContext;
  logger: Logger;
  apiClient: BaseApiClient;
  authClient: AuthClient;
  tokenManager: TokenManager;
  authManager: AuthManager;
  authenticatedClient: Pick<ExampleClient, 'getProtectedResource'>;
  exampleClient: ExampleClient;
  testContext: ScenarioContext;
};

/** Every fixture below is test/scenario scoped: no mutable module-level state. */
export const test = base.extend<ApiFixtures>({
  configuration: async ({}, use) => use(loadConfiguration()),
  apiRequest: async ({ configuration }, use) => {
    const context = await playwrightRequest.newContext({ baseURL: configuration.baseUrl, ignoreHTTPSErrors: !configuration.verifySsl, extraHTTPHeaders: { accept: 'application/json' } });
    await use(context);
    await context.dispose();
  },
  logger: async ({}, use, testInfo) => use(new ConsoleLogger(testInfo.title)),
  apiClient: async ({ apiRequest, configuration, logger }, use) => use(new BaseApiClient(apiRequest, configuration, logger)),
  authClient: async ({ apiClient, configuration }, use) => use(new AuthClient(apiClient, configuration)),
  tokenManager: async ({}, use) => use(new TokenManager()),
  authManager: async ({ authClient, configuration, tokenManager }, use) => use(new AuthManager(authClient, tokenManager, configuration)),
  authenticatedClient: async ({ apiRequest, configuration, logger, tokenManager }, use) => {
    // Resolve the token at call time: Given steps execute after fixture setup.
    await use({
      getProtectedResource: () => {
        const token = tokenManager.accessToken();
        if (!token) throw new Error('Authenticated client requested before authentication. Use Given I am authenticated first.');
        return new ExampleClient(new BaseApiClient(apiRequest, configuration, logger, token), configuration).getProtectedResource();
      },
    });
  },
  exampleClient: async ({ apiClient, configuration }, use) => use(new ExampleClient(apiClient, configuration)),
  testContext: async ({}, use) => use({ testData: {} }),
});
