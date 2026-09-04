Feature: API Authentication
  As an API consumer
  I want to authenticate with the API
  So that I can access protected resources

  Background:
    Given the API is available

  @smoke @auth @requires-auth
  Scenario: Authenticate with valid credentials
    When I authenticate with valid credentials
    Then the authentication request should succeed
    And an access token should be returned

  @auth @regression @requires-auth
  Scenario Outline: Authentication fails with invalid credentials
    When I authenticate with invalid credentials
    Then the authentication request should fail
    And an appropriate authentication error should be returned

    Examples:
      | credential type |
      | invalid user    |
