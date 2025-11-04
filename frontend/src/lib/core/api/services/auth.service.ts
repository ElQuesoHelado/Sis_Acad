import type { LoginRequest, LoginResponse, UserRole } from '$lib/core/api/types';
import api from './axios';
import { TOKEN_KEY, ROLE_KEY, PROFILE_ID_KEY } from '$lib/core/api/constants';

const BASE_URL = '/api/auth';

export const authService = {
	/**
	 * Authenticates a user.
	 * Sends a POST request to /api/auth/login.
	 * Stores token, role, and profile ID in localStorage if successful.
	 */
	login: async (credentials: LoginRequest): Promise<LoginResponse> => {
		const response = await api.post<LoginResponse>(`${BASE_URL}/login`, credentials);
		const { token, role, profileId } = response.data;

		if (token && role && profileId) {
			localStorage.setItem(TOKEN_KEY, token);
			localStorage.setItem(ROLE_KEY, role);
			localStorage.setItem(PROFILE_ID_KEY, profileId);
		} else {
			// Clean up storage in case of incomplete API response
			authService.logout();
			throw new Error('Incomplete login response from API.');
		}

		return response.data;
	},

	/**
	 * Logs out the current user.
	 * Clears stored authentication data and redirects to the login page.
	 */
	logout: () => {
		localStorage.removeItem(TOKEN_KEY);
		localStorage.removeItem(ROLE_KEY);
		localStorage.removeItem(PROFILE_ID_KEY);

		// Redirect to login if not already there
		if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
			window.location.href = '/login';
		}
	},

	/**
	 * Returns the current user's role, or null if unavailable.
	 */
	getUserRole: (): UserRole | null => {
		if (typeof window === 'undefined') return null;
		return localStorage.getItem(ROLE_KEY) as UserRole | null;
	},

	/**
	 * Returns the current user's profile ID, or null if unavailable.
	 */
	getUserProfileId: (): string | null => {
		if (typeof window === 'undefined') return null;
		return localStorage.getItem(PROFILE_ID_KEY);
	},

	/**
	 * Returns the stored JWT token, or null if unavailable.
	 */
	getToken: (): string | null => {
		if (typeof window === 'undefined') return null;
		return localStorage.getItem(TOKEN_KEY);
	}
};
