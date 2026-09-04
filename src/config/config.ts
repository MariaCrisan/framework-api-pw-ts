import { loadConfig, type FrameworkConfig } from './config-loader';
export type { FrameworkConfig } from './config-loader';

export const config: Readonly<FrameworkConfig> = Object.freeze(loadConfig());

/** True after a real API host has replaced the checked-in safe placeholder. */
export function isBaseUrlConfigured(): boolean {
  return !config.baseUrl.includes('.invalid');
}

/** True only after a real endpoint and test credentials have been supplied. */
export function isFrameworkConfigured(): boolean {
  return isBaseUrlConfigured() && Boolean(process.env.API_USERNAME && process.env.API_PASSWORD);
}

export interface Credentials { username: string; password: string; }

export function getCredentials(): Credentials {
  const { API_USERNAME: username, API_PASSWORD: password } = process.env;
  if (!username || !password) {
    throw new Error('API_USERNAME and API_PASSWORD must be provided through the environment or CI secret store.');
  }
  return { username, password };
}
