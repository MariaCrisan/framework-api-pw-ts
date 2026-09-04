import { createBdd } from 'playwright-bdd';
import { config, getCredentials, isBaseUrlConfigured, isFrameworkConfigured } from '../../src/config/config';
import { expectJsonResponse, expectResponseContains, expectResponseTimeBelow, expectStatus, expectSuccess } from '../../src/assertions/response-assertions';
import { test } from '../../src/fixtures/api-fixtures';

const { Given, When, Then } = createBdd(test);

function requireResponse(response: unknown): asserts response is NonNullable<typeof response> {
  if (!response) throw new Error('No API response is available. A When step must make a request before this assertion.');
}

Given('the API test environment is configured', async ({ $test }) => {
  $test.skip(!isBaseUrlConfigured(), 'Configure a real baseUrl before running API scenarios.');
});

Given('valid API credentials are configured', async ({ $test }) => {
  $test.skip(!isFrameworkConfigured(), 'Set API_USERNAME and API_PASSWORD through the shell or CI secret store.');
});

When('I request the health endpoint', async ({ apiClient, apiScenario }) => {
  // Placeholder: replace /health when the real API contract uses another readiness endpoint.
  apiScenario.response = await apiClient.get('/health');
});

When('I authenticate with valid credentials', async ({ authClient, apiScenario }) => {
  apiScenario.response = await authClient.login(getCredentials());
});

When('I authenticate with invalid credentials', async ({ authClient, apiScenario }) => {
  apiScenario.response = await authClient.login({ username: 'invalid-user', password: 'invalid-password' });
});

When('I request the protected endpoint as an authenticated user', async ({ authenticatedClient, apiScenario }) => {
  apiScenario.response = await authenticatedClient.get(config.auth.protectedPath);
});

When('I request the protected endpoint without authentication', async ({ apiClient, apiScenario }) => {
  apiScenario.response = await apiClient.get(config.auth.protectedPath);
});

When('I retrieve the example collection', async ({ exampleClient, apiScenario }) => {
  apiScenario.response = await exampleClient.getCollection();
});

Then('the API response is successful', async ({ apiScenario }) => {
  requireResponse(apiScenario.response);
  await expectSuccess(apiScenario.response);
});

Then('the API response is valid JSON', async ({ apiScenario }) => {
  requireResponse(apiScenario.response);
  await expectJsonResponse(apiScenario.response);
});

Then('the API response time is below the configured timeout', async ({ apiScenario }) => {
  requireResponse(apiScenario.response);
  expectResponseTimeBelow(apiScenario.response, config.timeout);
});

Then('the API response includes an authentication token', async ({ apiScenario }) => {
  requireResponse(apiScenario.response);
  await expectResponseContains(apiScenario.response, 'accessToken'); // Map this to access_token if needed.
});

Then('the API response does not include an authentication token', async ({ apiScenario }) => {
  requireResponse(apiScenario.response);
  const body = await expectJsonResponse(apiScenario.response);
  const hasToken = !Array.isArray(body) && ('accessToken' in body || 'access_token' in body);
  if (hasToken) throw new Error('Authentication error response must not contain a usable token.');
});

Then('the API response has the configured invalid-credentials status', async ({ apiScenario }) => {
  requireResponse(apiScenario.response);
  await expectStatus(apiScenario.response, config.auth.invalidCredentialsStatus);
});

Then('the API response has the configured unauthorized status', async ({ apiScenario }) => {
  requireResponse(apiScenario.response);
  await expectStatus(apiScenario.response, config.auth.unauthenticatedStatus);
});
