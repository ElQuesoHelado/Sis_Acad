import type { IHttpClient } from '$lib/core/interfaces/http-client.interface';
import { httpClient } from '$lib/core/adapters';
import { API_ENDPOINTS } from '$lib/core/constants/api-endpoints.constants';
import type { UserProfile } from '../domain/user.types';

/**
 * Application service for teacher use cases.
 */
class UserService {
	constructor(private http: IHttpClient) {}

	/** Get user profile info */
	public getProfile(): Promise<UserProfile> {
		return this.http.get<UserProfile>(API_ENDPOINTS.USER.PROFILE());
	}
}

/** Singleton instance of userService */
export const userService = new UserService(httpClient);
