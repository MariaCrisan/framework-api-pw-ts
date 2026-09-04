export interface EndpointConfig {
  health: string;
  login: string;
  protectedResource: string;
}

export interface AuthenticationConfig {
  enabled: boolean;
  tokenField: string;
  tokenType: string;
}

export interface FrameworkConfig {
  environment: string;
  baseUrl: string;
  apiVersion: string;
  timeout: number;
  verifySsl: boolean;
  endpoints: EndpointConfig;
  auth: AuthenticationConfig;
  credentials: {
    username?: string;
    password?: string;
    clientId?: string;
    clientSecret?: string;
    apiKey?: string;
  };
}
