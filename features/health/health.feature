@health @smoke
Feature: API availability
  The API should expose a reachable health endpoint.

  Scenario: The health endpoint is available
    Given the API test environment is configured
    When I request the health endpoint
    Then the API response is successful
    And the API response is valid JSON
    And the API response time is below the configured timeout
