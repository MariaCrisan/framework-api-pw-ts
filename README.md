# TypeScript + Playwright BDD API framework

A production-oriented starting point for API automation with TypeScript, Playwright Test and `playwright-bdd`. Gherkin expresses the API behaviour; reusable framework code owns HTTP, authentication, configuration, diagnostics, and assertions. It deliberately contains only a small baseline suite.

> **Contract placeholders:** `config/local.json` points health checks to the public Postman Echo service so the baseline health examples run. Login and protected-resource endpoints in every configuration are placeholders until mapped to the target API. Authentication scenarios are tagged `@requires-auth` and are transparently skipped while `auth.enabled` is `false`; they are never simulated as passing.

## Architecture

```text
Feature (.feature)
        ↓
Thin step definition
        ↓
Scenario-scoped Playwright BDD fixture + testContext
        ↓
AuthManager / endpoint client / response assertion
        ↓
BaseApiClient
        ↓
Playwright APIRequestContext
        ↓
API
```

`playwright-bdd` discovers the feature and step files, and `bddgen test` emits disposable Playwright specifications in `.features-gen/`. Playwright Test runs those generated files, including parallel scheduling, retries, HTML/JUnit reporting, traces, and tag filtering. Do not edit `.features-gen`.

## Layout

```text
features/                 business-readable Gherkin specifications
steps/                    thin reusable Given/When/Then bindings
src/clients/              BaseApiClient and endpoint clients
src/auth/                 provider, manager, and scenario token store
src/assertions/           Playwright expect-based API helpers
src/config/ + config/     typed loader and local/dev/test/staging JSON
src/fixtures/             test-scoped BDD fixtures and ScenarioContext
src/models/               request and response contracts
src/test-data/            static data and factories
src/utils/                logging, masking, serialization, random data
```

## Install and configure

```bash
npm install
npx playwright install
copy .env.example .env
```

Set `TEST_ENV` to `local`, `dev`, `test`, or `staging`. The loader is the only layer that reads environment variables; steps and clients use the typed `configuration` fixture. Secrets belong in environment variables (or CI secrets), never feature files or JSON configuration:

```text
API_USERNAME, API_PASSWORD, CLIENT_ID, CLIENT_SECRET, API_KEY
```

For a real target, replace the endpoint placeholders in the selected `config/<environment>.json`, set `auth.enabled` to `true`, and align `auth.tokenField` / `auth.tokenType` with its contract. Configuration is loaded once per scenario fixture so process variables are not read by tests or steps directly.

## Run

```bash
npm test
npm run test:smoke
npm run test:auth
npm run test:health
npm run test:regression
TEST_ENV=staging npm test
npm run report
```

On PowerShell, select an environment with `$env:TEST_ENV='staging'; npm test`. The `test:*` commands generate BDD files before invoking Playwright. HTML output is in `playwright-report/`; JUnit XML is `test-results/junit.xml`.

Playwright retries failed scenarios only in CI (`retries: 2`). This is test-level retry; the framework intentionally does not perform broad HTTP retries, which could hide functional failures. Set workers through Playwright as needed; the configuration uses full parallel execution.

## Authentication and scenario isolation

`Given I am authenticated` invokes `AuthManager`, which delegates to the bearer-token `AuthenticationProvider`, `AuthClient`, and then `BaseApiClient`. The result is held by a `TokenManager` that is created for one scenario only. `authenticatedClient` resolves that token at request time. There is no mutable module-level scenario state, cached token shared among workers, or order dependency. This makes independent users and parallel scenarios safe by default.

The bearer implementation is intentionally an extension point: add an `AuthenticationProvider` for API keys, OAuth/client credentials, basic authentication, or refresh flow without changing Gherkin or endpoint clients.

## Logs, errors, and security

Every request has a UUID request ID and emits method, endpoint, status, duration, and ID. `Authorization`, token, password, client-secret, and API-key fields are masked recursively before logging or assertion diagnostics. Failed assertions show safely serialized response diagnostics with endpoint and request ID. Use `LOG_LEVEL=debug` for request diagnostics; tokens are still masked. Playwright traces are retained only on failure.

## Extending the suite

To add an endpoint, first define meaningful contracts under `src/models/requests` and `src/models/responses`, then add a focused endpoint client. For example:

```ts
export class UserClient {
  constructor(private readonly api: BaseApiClient) {}
  getProfile() { return this.api.get('/users/me'); }
}
```

Expose the client through `src/fixtures/api-fixtures.ts` if multiple steps require it. Reuse an existing behavior-level step where it fits; otherwise add a short binding in the relevant file under `steps/` that calls the fixture/client and records its result in `testContext`.

Then create `features/users/users.feature` with behavior-focused language and an appropriate tag:

```gherkin
@regression
Feature: User profile
  Scenario: Authenticated user reads their profile
    Given I am authenticated
    When I view my profile
    Then the request should succeed
```

Add `When I view my profile` only if no existing reusable action communicates that behavior. Do not put URLs, headers, credentials, or JSON serialization in Gherkin. Do not create generic steps that obscure the operation being tested.

## CI/CD

The GitHub Actions workflow installs exact lockfile dependencies, type-checks, runs the suite headlessly, and uploads the HTML report. Store credentials as repository secrets and set the selected environment configuration to the real CI API before enabling auth scenarios. A CI test run uses Playwright retries; local runs do not.
