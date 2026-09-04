import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getEnvironmentName, type EnvironmentName } from './environment';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface AuthConfig {
  loginPath: string;
  refreshPath?: string;
  protectedPath: string;
  unauthenticatedStatus: number;
  invalidCredentialsStatus: number;
}

export interface FrameworkConfig {
  environment: EnvironmentName;
  baseUrl: string;
  apiVersion: string;
  timeout: number;
  expectTimeout: number;
  verifySsl: boolean;
  logLevel: LogLevel;
  auth: AuthConfig;
  examplePath: string;
}

type ConfigFile = Omit<FrameworkConfig, 'environment'>;

export function loadConfig(): FrameworkConfig {
  const environment = getEnvironmentName();
  const file = resolve(process.cwd(), 'config', `${environment}.json`);
  let raw: ConfigFile;
  try {
    raw = JSON.parse(readFileSync(file, 'utf-8')) as ConfigFile;
  } catch (error) {
    throw new Error(`Unable to load configuration for "${environment}" from ${file}: ${String(error)}`);
  }

  if (!raw.baseUrl || !raw.auth?.loginPath || !raw.auth?.protectedPath) {
    throw new Error(`Configuration for "${environment}" is missing a required API URL or authentication path.`);
  }
  return { ...raw, environment };
}
