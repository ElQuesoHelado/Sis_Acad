import type { IHttpClient, HttpRequestConfig, ISessionStorage } from '$lib/core/interfaces';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import axios, { type AxiosRequestConfig } from 'axios';
import { PUBLIC_API_URL } from '$env/static/public';
import { sessionStorage } from './local-storage-session.adapter';

/**
 * Translates neutral HttpRequestConfig to a specific AxiosRequestConfig.
 */
function translateConfig(config?: HttpRequestConfig): AxiosRequestConfig {
	if (!config) return {};
	// Additional logic could go here
	return config as AxiosRequestConfig;
}

/**
 * Concrete implementation of IHttpClient using Axios
 * This is now the only place responsible for Axios logic, including interceptors.
 */
class AxiosHttpClient implements IHttpClient {
	private readonly client: AxiosInstance;
	private readonly session: ISessionStorage;

	constructor(sessionStorage: ISessionStorage) {
		this.session = sessionStorage;
		this.client = axios.create({ baseURL: PUBLIC_API_URL });
		this.setupInterceptors();
	}

	/**
	 * Configures Axios interceptors.
	 */
	private setupInterceptors(): void {
		// Request interceptor: adds JWT token
		this.client.interceptors.request.use(
			(config) => {
				const token = this.session.getToken();
				if (token) config.headers.Authorization = `Bearer ${token}`;
				return config;
			},
			(error) => Promise.reject(error)
		);

		// Response interceptor: handles 401
		this.client.interceptors.response.use(
			(response) => response,
			(error: AxiosError) => {
				const originalRequestConfig = error.config as InternalAxiosRequestConfig &
					HttpRequestConfig;

				if (error.response?.status === 401 && !originalRequestConfig?.meta?.noAuthRedirect) {
					console.warn('Interceptor 401: Session expired. Clearing session.');
					this.handleUnauthorized();
				}

				return Promise.reject(error);
			}
		);
	}

	/** Handles 401 by clearing the session. */
	private handleUnauthorized(): void {
		this.session.clearSession();
	}

	public async get<T>(url: string, config?: HttpRequestConfig): Promise<T> {
		const axiosConfig = translateConfig(config);
		const response = await this.client.get<T>(url, axiosConfig);
		return response.data;
	}

	public async post<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<T> {
		const axiosConfig = translateConfig(config);
		const response = await this.client.post<T>(url, data, axiosConfig);
		return response.data;
	}

	public async patch<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<T> {
		const axiosConfig = translateConfig(config);
		const response = await this.client.patch<T>(url, data, axiosConfig);
		return response.data;
	}

	public async delete<T>(url: string, config?: HttpRequestConfig): Promise<T> {
		const axiosConfig = translateConfig(config);
		const response = await this.client.delete<T>(url, axiosConfig);
		return response.data;
	}
}

/** Singleton instance: injects session storage into the HTTP adapter */
export const httpClient = new AxiosHttpClient(sessionStorage);
