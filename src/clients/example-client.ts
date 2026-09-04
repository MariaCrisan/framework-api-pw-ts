import { BaseApiClient } from './base-api-client';

export class ExampleClient extends BaseApiClient {
  getCollection() { return this.get<unknown[]>(this.frameworkConfig.examplePath); }
}
