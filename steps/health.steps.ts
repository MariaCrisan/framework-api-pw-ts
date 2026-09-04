import { createBdd } from 'playwright-bdd';
import { expectJsonResponse, expectSuccess } from '../src/assertions/response-assertions';
import { test } from '../src/fixtures/api-fixtures';

const { When, Then } = createBdd(test);

When('I check the API health', async ({ exampleClient, testContext }) => {
  testContext.lastResult = await exampleClient.checkHealth();
  testContext.requestId = testContext.lastResult.requestId;
});

Then('the health request should succeed', async ({ testContext }) => {
  if (!testContext.lastResult) throw new Error('No health request was made.');
  await expectSuccess(testContext.lastResult);
});

Then('the API should return a valid health response', async ({ testContext }) => {
  if (!testContext.lastResult) throw new Error('No health response was available.');
  await expectJsonResponse(testContext.lastResult.response);
});
