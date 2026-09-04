@auth
Feature: API authentication
  Consumers authenticate once and use the resulting token for protected resources.

  @smoke
  Scenario: Valid credentials return a usable token
    Given the API test environment is configured
    And valid API credentials are configured
    When I authenticate with valid credentials
    Then the API response is successful
    And the API response includes an authentication token

  @regression
  Scenario: Invalid credentials are rejected without a token
    Given the API test environment is configured
    When I authenticate with invalid credentials
    Then the API response has the configured invalid-credentials status
    And the API response does not include an authentication token

  @smoke
  Scenario: An authenticated user can access the protected endpoint
    Given the API test environment is configured
    And valid API credentials are configured
    When I request the protected endpoint as an authenticated user
    Then the API response is successful

  @regression
  Scenario: A protected endpoint rejects missing authentication
    Given the API test environment is configured
    When I request the protected endpoint without authentication
    Then the API response has the configured unauthorized status
