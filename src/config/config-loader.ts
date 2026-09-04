import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadDotEnv } from 'dotenv';
import { type FrameworkConfig } from './config';
import { isEnvironment } from './environment';

loadDotEnv({ quiet: true });

export function loadConfiguration(): FrameworkConfig {
  const requestedEnvironment = process.env.TEST_ENV ?? 'local';
  if (!isEnvironment(requestedEnvironment)) {
    throw new Error(`Unsupported TEST_ENV '${requestedEnvironment}'. Use local, dev, test, or staging.`);
  }

  const file = resolve(process.cwd(), 'config', `${requestedEnvironment}.json`);
  if (!existsSync(file)) throw new Error(`Configuration file not found: ${file}`);
  const raw = JSON.parse(readFileSync(file, 'utf8')) as Omit<FrameworkConfig, 'environment' | 'credentials'>;
  if (!raw.baseUrl || !raw.endpoints?.health) throw new Error(`Configuration '${requestedEnvironment}' requires baseUrl and endpoints.health.`);

  return {
    ...raw,
    environment: requestedEnvironment,
    credentials: {
      username: process.env.API_USERNAME,
      password: process.env.API_PASSWORD,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      apiKey: process.env.API_KEY,
    },
  };
}
