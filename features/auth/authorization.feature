Feature: API Authorization
  As an API consumer
  I want protected resources to enforce access rules
  So that data remains secure

  @auth @regression @requires-auth
  Scenario: Authenticated user can access a protected resource
    Given I am authenticated
    When I access a protected resource
    Then the request should succeed

  @auth @regression @requires-auth
  Scenario: Unauthenticated user cannot access a protected resource
    Given I am not authenticated
    When I access a protected resource without authentication
    Then the request should be unauthorized
