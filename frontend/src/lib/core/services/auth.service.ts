import { ApiService } from './api.service';
import type { UserResponse, LoginResponse, LoginRequest, UserSummary } from './types';

/**
 * Service class for handling authentication-related API calls.
 */
export class AuthService {
	/**
	 * Authenticates a user with the provided credentials.
	 * Corresponds to: POST /auth/login
	 * Stores the received token in localStorage upon success.
	 * @param credentials - The user's email and password.
	 * @returns A promise that resolves with the UserSummary object upon successful login.
	 */
	static async login(credentials: LoginRequest): Promise<UserSummary> {
		try {
			const response = await ApiService.post<LoginResponse>('/auth/login', credentials, {
				_noAuthRedirect: true
			});
			if (response.token && response.user) {
				localStorage.setItem('authToken', response.token);
				return response.user;
			} else {
				throw new Error('Login failed: Invalid response from server.');
			}
		} catch (error) {
			console.error('AuthService.login error:', error instanceof Error ? error.message : error);
			throw error;
		}
	}

	/**
	 * Logs out the current user by removing the authentication token from localStorage.
	 */
	static async logout(): Promise<void> {
		localStorage.removeItem('authToken');
		return Promise.resolve();
	}

	/**
	 * Retrieves the profile information of the currently authenticated user.
	 * Corresponds to: GET /auth/profile
	 * @returns A promise that resolves with the full UserResponse object.
	 */
	static async getProfile(): Promise<UserResponse> {
		try {
			// Backend endpoint GET /auth/profile returns { user: UserResponse }
			const response = await ApiService.get<{ user: UserResponse }>('/auth/profile', {
				_noAuthRedirect: true
			});
			if (response && response.user) {
				return response.user;
			} else {
				throw new Error('Failed to retrieve profile: Invalid response structure.');
			}
		} catch (error) {
			console.error(
				'AuthService.getProfile error:',
				error instanceof Error ? error.message : error
			);
			throw error;
		}
	}
}
