@regression
Feature: Example API client
  Endpoint-specific clients keep API details out of scenarios.

  Scenario: A collection can be retrieved through its API client
    Given the API test environment is configured
    When I retrieve the example collection
    Then the API response is successful
