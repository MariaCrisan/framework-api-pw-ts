import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { expectJsonResponse, expectSuccess, expectUnauthorized } from '../src/assertions/response-assertions';
import { test } from '../src/fixtures/api-fixtures';

const { Given, When, Then } = createBdd(test);
const requireConfiguredAuth = (enabled: boolean) => test.skip(!enabled, 'Authentication examples are placeholders until login and protected-resource endpoints are configured.');

When('I authenticate with valid credentials', async ({ configuration, authManager, testContext }) => {
  requireConfiguredAuth(configuration.auth.enabled);
  testContext.accessToken = await authManager.authenticateWithValidCredentials();
});

When('I authenticate with invalid credentials', async ({ configuration, authManager, testContext }) => {
  requireConfiguredAuth(configuration.auth.enabled);
  testContext.lastResult = await authManager.authenticateWithInvalidCredentials();
});

Then('the authentication request should succeed', async ({ configuration, testContext }) => {
  requireConfiguredAuth(configuration.auth.enabled);
  expect(testContext.accessToken, 'AuthManager should have retained a token for this scenario.').toBeTruthy();
});

Then('an access token should be returned', async ({ configuration, testContext }) => {
  requireConfiguredAuth(configuration.auth.enabled);
  expect(testContext.accessToken, 'An access token was not returned.').toBeTruthy();
});

Then('the authentication request should fail', async ({ configuration, testContext }) => {
  requireConfiguredAuth(configuration.auth.enabled);
  if (!testContext.lastResult) throw new Error('No authentication request was made.');
  expect(testContext.lastResult.response.ok()).toBeFalsy();
});

Then('an appropriate authentication error should be returned', async ({ configuration, testContext }) => {
  requireConfiguredAuth(configuration.auth.enabled);
  if (!testContext.lastResult) throw new Error('No authentication response was available.');
  expect(testContext.lastResult.response.status()).toBeGreaterThanOrEqual(400);
});

Given('I am authenticated', async ({ configuration, authManager, testContext }) => {
  requireConfiguredAuth(configuration.auth.enabled);
  testContext.accessToken = await authManager.authenticateWithValidCredentials();
});

Given('I am not authenticated', async ({ authManager }) => authManager.clearAuthentication());

When('I access a protected resource', async ({ configuration, authenticatedClient, testContext }) => {
  requireConfiguredAuth(configuration.auth.enabled);
  testContext.lastResult = await authenticatedClient.getProtectedResource();
});

When('I access a protected resource without authentication', async ({ configuration, exampleClient, testContext }) => {
  requireConfiguredAuth(configuration.auth.enabled);
  testContext.lastResult = await exampleClient.getProtectedResource();
});

Then('the request should be unauthorized', async ({ configuration, testContext }) => {
  requireConfiguredAuth(configuration.auth.enabled);
  if (!testContext.lastResult) throw new Error('No protected-resource response was available.');
  await expectUnauthorized(testContext.lastResult);
});
