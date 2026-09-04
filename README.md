# Playwright API Test Framework

A small, composable TypeScript foundation for API tests using Playwright's native `APIRequestContext`. It deliberately includes only representative health and authentication tests; replace the clearly marked endpoint placeholders with the real API contract.

## Quick start

```bash
npm install
npx playwright install
npm run typecheck
npm test
```

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
src/config/              Validated configuration access; tests never read process.env
src/clients/             Base HTTP wrapper and endpoint-focused clients
src/auth/                Authentication providers, token cache, and login lifecycle
src/assertions/          Reusable response assertions with safe diagnostics
src/fixtures/            Playwright fixtures that compose clients for each test
src/models/              Request and response contracts
src/test-data/           Replaceable static/factory-style test data
src/utils/               Masking, logging, serialization, and random data
tests/                   Small health, authentication, and usage examples
```

`BaseApiClient` owns common headers, request IDs, timeout, error context, and request/response metadata logging. `AuthClient`, `UserClient`, and `ExampleClient` own endpoint paths and API-specific method names. Tests stay focused on behavior and assertions rather than URLs or `APIRequestContext` details.

## Configuration and secrets

Set `TEST_ENV` to `local`, `dev`, `test`, or `staging`; it selects `config/<environment>.json`. These files may contain non-secret operational settings such as `baseUrl`, API version, SSL behavior, timeouts, endpoint paths, and expected unauthorized statuses. Environment variables supply credentials only through `getCredentials()` in the configuration layer. `.env` is ignored and `.env.example` contains placeholders only.

Before enabling a real environment, replace these placeholders:

| Setting | Placeholder to replace |
| --- | --- |
| API host | `https://api.example.invalid` |
| Login endpoint | `/auth/login` |
| Refresh endpoint | `/auth/refresh` |
| Protected endpoint | `/users/me` |
| Health endpoint | `/health` in `tests/health/health.spec.ts` |
| Example collection | `/resources` |
| Token JSON shape | `accessToken`, `expiresIn`, `refreshToken` (or mapped snake_case alternatives) |
| Authentication failure statuses | `auth.invalidCredentialsStatus`, `auth.unauthenticatedStatus` |

If your login body, health response, headers, or token fields differ, update `LoginRequest`, `LoginResponse`, `AuthClient`, and the example expectations to match the contract.

## Authentication lifecycle

Each test receives its own `AuthManager` and `TokenManager`. On the first authenticated request, the manager uses the secret-backed credentials to log in, caches the token only in that fixture instance, and provides a `BearerTokenAuthenticationProvider`. A valid cached token is reused; if it is expired and a refresh token/path exists, it attempts refresh before logging in again. The cache is not global and is discarded after the test, so workers cannot overwrite one another's tokens. `ApiKeyAuthenticationProvider` shows how another scheme can be added without changing tests or the base client.

## Fixtures and parallel execution

Import `test` from `src/fixtures/api-fixtures`. It supplies `apiClient`, `authClient`, `authManager`, `userClient`, `exampleClient`, and `authenticatedClient`. Fixtures perform setup only; business assertions remain in test files. Playwright runs tests fully in parallel, and all stateful objects (especially token caches) are fixture/test-scoped. Do not add mutable module-level data or execution-order dependencies.

```ts
import { test } from '../src/fixtures/api-fixtures';
import { expectSuccess } from '../src/assertions/response-assertions';

test('profile is available', { tag: ['@auth', '@smoke'] }, async ({ authenticatedClient }) => {
  const response = await authenticatedClient.get('/users/me');
  await expectSuccess(response);
});
```

## Adding an API client and test

1. Add meaningful request/response interfaces under `src/models/`.
2. Add an endpoint-focused client extending `BaseApiClient`.
3. Add a fixture only when it makes test setup simpler.
4. Add test data under `src/test-data/` and a tagged spec under `tests/`.
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
test('user can be retrieved', { tag: ['@regression'] }, async ({ userClient }) => {
  const response = await userClient.getUser('123');
  await expectSuccess(response);
});
```

## Logging, diagnostics, and security

The logger records method, endpoint, status, duration, and correlation ID. It does not log request/response bodies by default. Any diagnostics that do include response content pass through recursive masking; authorization, cookies, passwords, client secrets, access/refresh tokens, and API keys are redacted. Never put credentials in config JSON, test names, expected strings, or CI logs.

Playwright produces an HTML report and JUnit XML at `test-results/junit.xml`; traces are retained for failures. Test retries are Playwright-level retries (two in CI), which rerun a failed test. This skeleton deliberately has no HTTP retry policy; add one later only for identified transient endpoints and make it configurable.

## CI

The GitHub Actions workflow installs dependencies, runs type checking and the suite, and uploads the HTML report. Add `API_USERNAME` and `API_PASSWORD` as repository secrets, configure `config/test.json` with the non-secret test endpoint details, then run with `TEST_ENV=test npm test`. The project is headless by default and needs no browser-specific test code for API requests.
