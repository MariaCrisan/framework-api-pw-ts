export const environmentNames = ['local', 'dev', 'test', 'staging'] as const;
export type EnvironmentName = (typeof environmentNames)[number];

export function getEnvironmentName(value = process.env.TEST_ENV): EnvironmentName {
  const environment = value ?? 'local';
  if (!environmentNames.includes(environment as EnvironmentName)) {
    throw new Error(`Invalid TEST_ENV "${environment}". Supported values: ${environmentNames.join(', ')}.`);
  }
  return environment as EnvironmentName;
}
