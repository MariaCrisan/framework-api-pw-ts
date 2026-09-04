export const environments = ['local', 'dev', 'test', 'staging'] as const;
export type Environment = (typeof environments)[number];

export function isEnvironment(value: string): value is Environment {
  return (environments as readonly string[]).includes(value);
}
