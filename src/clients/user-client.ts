import { BaseApiClient } from './base-api-client';

export interface UserResponse { id: string; [key: string]: unknown; }

export class UserClient extends BaseApiClient {
  getProfile() { return this.get<UserResponse>(this.frameworkConfig.auth.protectedPath); }
  getUser(id: string) { return this.get<UserResponse>(`/users/${encodeURIComponent(id)}`); }
}
