# Playwright BDD API Test Framework

A small, composable TypeScript foundation for API tests using Playwright's native `APIRequestContext` and `playwright-bdd`. Gherkin feature files state the behavior; typed step definitions exercise the reusable API layer. It deliberately includes only representative health and authentication scenarios; replace the clearly marked endpoint placeholders with the real API contract.

## Quick start

```bash
npm install
npx playwright install
npm run typecheck
npm test
```

`npm test` first generates Playwright tests from the `.feature` files, then executes them. You can run generation alone with `npm run bdd:generate`; generated files belong in `.features-gen/` and are ignored by Git.

The checked-in configurations use `https://api.example.invalid`, so the sample tests intentionally **skip** until a real endpoint is supplied; authentication examples also require `API_USERNAME`/`API_PASSWORD`. This lets a fresh clone compile and run safely without pretending an API exists. `.env.example` documents the required secret names; export them in the shell or inject them from CI (this skeleton deliberately avoids a dotenv dependency).

```powershell
$env:TEST_ENV = 'staging'
$env:API_USERNAME = 'test-user'
$env:API_PASSWORD = 'secret-from-vault'
npm test
```

Common commands:

```bash
npm test
npm run test:smoke
npm run test:auth
npm run test:health
npm run test:report
```

## Layout

```text
config/                  Non-secret per-environment settings (local, dev, test, staging)
features/                Gherkin feature files
src/config/              Validated configuration access; tests never read process.env
src/clients/             Base HTTP wrapper and endpoint-focused clients
src/auth/                Authentication providers, token cache, and login lifecycle
src/assertions/          Reusable response assertions with safe diagnostics
src/fixtures/            Playwright fixtures that compose clients for each test
src/steps/               Reusable Playwright-BDD step implementations
src/models/              Request and response contracts
src/test-data/           Replaceable static/factory-style test data
src/utils/               Masking, logging, serialization, and random data
.features-gen/           Generated Playwright tests (not committed)
```

`BaseApiClient` owns common headers, request IDs, timeout, error context, and request/response metadata logging. `AuthClient`, `UserClient`, and `ExampleClient` own endpoint paths and API-specific method names. Gherkin scenarios stay focused on behavior; `src/steps/api.steps.ts` maps their wording to typed clients and assertions.

## Configuration and secrets

Set `TEST_ENV` to `local`, `dev`, `test`, or `staging`; it selects `config/<environment>.json`. These files may contain non-secret operational settings such as `baseUrl`, API version, SSL behavior, timeouts, endpoint paths, and expected unauthorized statuses. Environment variables supply credentials only through `getCredentials()` in the configuration layer. `.env` is ignored and `.env.example` contains placeholders only.

Before enabling a real environment, replace these placeholders:

| Setting | Placeholder to replace |
| --- | --- |
| API host | `https://api.example.invalid` |
| Login endpoint | `/auth/login` |
| Refresh endpoint | `/auth/refresh` |
| Protected endpoint | `/users/me` |
| Health endpoint | `/health` in `src/steps/api.steps.ts` |
| Example collection | `/resources` |
| Token JSON shape | `accessToken`, `expiresIn`, `refreshToken` (or mapped snake_case alternatives) |
| Authentication failure statuses | `auth.invalidCredentialsStatus`, `auth.unauthenticatedStatus` |

If your login body, health response, headers, or token fields differ, update `LoginRequest`, `LoginResponse`, `AuthClient`, and the example expectations to match the contract.

## Authentication lifecycle

Each test receives its own `AuthManager` and `TokenManager`. On the first authenticated request, the manager uses the secret-backed credentials to log in, caches the token only in that fixture instance, and provides a `BearerTokenAuthenticationProvider`. A valid cached token is reused; if it is expired and a refresh token/path exists, it attempts refresh before logging in again. The cache is not global and is discarded after the test, so workers cannot overwrite one another's tokens. `ApiKeyAuthenticationProvider` shows how another scheme can be added without changing tests or the base client.

## BDD fixtures and parallel execution

`playwright-bdd` uses the exported `test` fixture from `src/fixtures/api-fixtures.ts` while generating native Playwright tests. It supplies `apiClient`, `authClient`, `authManager`, `userClient`, `exampleClient`, and a lazy `authenticatedClient`. `apiScenario` is a scenario-scoped response holder used only by its steps. Fixtures perform setup only; business assertions remain in step definitions. Playwright runs generated scenarios fully in parallel, and all stateful objects (especially token caches) are fixture/test-scoped. Do not add mutable module-level data or execution-order dependencies.

```gherkin
@auth @smoke
Scenario: An authenticated user can access their profile
  Given the API test environment is configured
  And valid API credentials are configured
  When I request the protected endpoint as an authenticated user
  Then the API response is successful
```

## Adding an API client and BDD scenario

1. Add meaningful request/response interfaces under `src/models/`.
2. Add an endpoint-focused client extending `BaseApiClient`.
3. Add a fixture only when it makes step setup simpler.
4. Add test data under `src/test-data/`, a tagged `.feature` scenario, and reusable step definitions under `src/steps/`.
5. Run `npm run typecheck` and the appropriate tagged command.

```ts
// src/clients/user-client.ts
class UserClient extends BaseApiClient {
  getUser(id: string) {
    return this.get<UserResponse>(`/users/${encodeURIComponent(id)}`);
  }
}
```

```ts
When('I retrieve user {string}', async ({ userClient, apiScenario }, id: string) => {
  apiScenario.response = await userClient.getUser(id);
});
```

```gherkin
@regression
Scenario: A user can be retrieved
  Given the API test environment is configured
  When I retrieve user "123"
  Then the API response is successful
```

## Logging, diagnostics, and security

The logger records method, endpoint, status, duration, and correlation ID. It does not log request/response bodies by default. Any diagnostics that do include response content pass through recursive masking; authorization, cookies, passwords, client secrets, access/refresh tokens, and API keys are redacted. Never put credentials in config JSON, test names, expected strings, or CI logs.

Playwright produces an HTML report and JUnit XML at `test-results/junit.xml`; traces are retained for failures. Test retries are Playwright-level retries (two in CI), which rerun a failed test. This skeleton deliberately has no HTTP retry policy; add one later only for identified transient endpoints and make it configurable.

## CI

The GitHub Actions workflow installs dependencies, runs type checking and the suite, and uploads the HTML report. Add `API_USERNAME` and `API_PASSWORD` as repository secrets, configure `config/test.json` with the non-secret test endpoint details, then run with `TEST_ENV=test npm test`. The project is headless by default and needs no browser-specific test code for API requests.
