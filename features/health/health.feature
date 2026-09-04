Feature: API Health
  As an API consumer
  I want to know whether the API is available
  So that dependent services can use it

  @smoke @health
  Scenario: API is available
    When I check the API health
    Then the health request should succeed
    And the API should return a valid health response
