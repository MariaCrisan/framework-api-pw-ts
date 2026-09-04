import { createBdd } from 'playwright-bdd';
import { expectSuccess } from '../src/assertions/response-assertions';
import { test } from '../src/fixtures/api-fixtures';

const { Given, Then } = createBdd(test);

Given('the API is available', async ({ exampleClient, testContext }) => {
  testContext.lastResult = await exampleClient.checkHealth();
  testContext.requestId = testContext.lastResult.requestId;
  await expectSuccess(testContext.lastResult);
});

Then('the request should succeed', async ({ testContext }) => {
  if (!testContext.lastResult) throw new Error('No request has been made in this scenario.');
  await expectSuccess(testContext.lastResult);
});
