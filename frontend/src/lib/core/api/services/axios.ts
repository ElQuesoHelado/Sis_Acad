import { PUBLIC_API_URL } from '$env/static/public';
import axios from 'axios';
import { TOKEN_KEY, ROLE_KEY, PROFILE_ID_KEY } from '$lib/core/api/constants';

/**
 * Pre-configured Axios instance for the API.
 * Only the `baseURL` is set.
 * `Content-Type` is handled automatically by Axios:
 * - 'application/json' for POST with objects
 * - nothing for GET requests
 */
export const api = axios.create({
	baseURL: PUBLIC_API_URL
});

/**
 * Request interceptor:
 * Adds the Authorization header if a token exists.
 */
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem(TOKEN_KEY);
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

/**
 * Response interceptor:
 * Handles 401 errors (expired/invalid token).
 * Clears localStorage and redirects to login if necessary.
 */
api.interceptors.response.use(
	(response) => response, // Pass successful responses
	(error) => {
		if (error.response?.status === 401) {
			console.warn(
				'Interceptor 401: Session expired or invalid. Clearing storage and redirecting.'
			);

			if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
				// Responsible for cleaning up authentication data
				localStorage.removeItem(TOKEN_KEY);
				localStorage.removeItem(ROLE_KEY);
				localStorage.removeItem(PROFILE_ID_KEY);
				window.location.href = '/login';
			}
		}

		return Promise.reject(error);
	}
);

export default api;
