export interface AuthenticationProvider {
  apply(headers: Record<string, string>): Record<string, string>;
}

export class BearerTokenAuthenticationProvider implements AuthenticationProvider {
  constructor(private readonly token: string) {}
  apply(headers: Record<string, string>): Record<string, string> {
    return { ...headers, Authorization: `Bearer ${this.token}` };
  }
}

export class ApiKeyAuthenticationProvider implements AuthenticationProvider {
  constructor(private readonly apiKey: string, private readonly header = 'X-API-Key') {}
  apply(headers: Record<string, string>): Record<string, string> {
    return { ...headers, [this.header]: this.apiKey };
  }
}
