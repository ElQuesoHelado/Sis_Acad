import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { env } from '$env/dynamic/public';

const API_BASE_URL = env.PUBLIC_API_URL || 'http://localhost:3000/api';

export interface CustomAxiosConfig extends AxiosRequestConfig {
	_noAuthRedirect?: boolean;
}

/**
 * Axios instance configured for API communication.
 * Includes base URL, timeout, and content type header.
 */
export const axiosInstance = axios.create({
	baseURL: API_BASE_URL,
	timeout: 15000, // 15 seconds
	headers: { 'Content-Type': 'application/json' }
});

/**
 * Request Interceptor:
 * Automatically attaches the JWT token (if available in localStorage)
 * to the Authorization header of outgoing requests.
 */
axiosInstance.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('authToken');
		if (token) {
			config.headers['Authorization'] = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		console.error('Axios request interceptor error:', error);
		return Promise.reject(error);
	}
);

/**
 * Response Interceptor:
 * Handles responses globally. Specifically checks for 401 Unauthorized errors
 * to clear the stored token and redirect the user to the login page.
 */
axiosInstance.interceptors.response.use(
	(response) => {
		// If the response is successful (status code 2xx), pass it through
		return response;
	},
	(error) => {
		if (axios.isAxiosError(error) && error.response) {
			const config = error.config as CustomAxiosConfig;
			if (error.response.status === 401 && !config._noAuthRedirect) {
				console.error('Unauthorized (401). Token invalid or expired. Redirecting to login.');
				localStorage.removeItem('authToken');
				if (typeof window !== 'undefined') {
					window.location.href = '/login';
				} else {
					console.warn('Cannot redirect on server-side for 401 error.');
				}
			}
		} else {
			console.error('Network error or unexpected issue:', error.message);
		}

		return Promise.reject(error);
	}
);
