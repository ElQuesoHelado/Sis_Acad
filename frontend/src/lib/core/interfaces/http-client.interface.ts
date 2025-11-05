/**
 * Defines a neutral HTTP request configuration,
 */
export interface HttpRequestConfig {
	headers?: Record<string, string>;
	params?: Record<string, unknown>;

	/**
	 * A generic "container" for passing metadata
	 * to implementation layers (interceptors and adapters).
	 * Example: { noAuthRedirect: true }
	 */
	meta?: Record<string, unknown>;
}

/**
 * Defines a contract for an HTTP client.
 */
export interface IHttpClient {
	/** Sends a GET request */
	get<T>(url: string, config?: HttpRequestConfig): Promise<T>;

	/** Sends a POST request */
	post<T>(url: string, data: unknown, config?: HttpRequestConfig): Promise<T>;

	/** Sends a PATCH request */
	patch<T>(url: string, data: unknown, config?: HttpRequestConfig): Promise<T>;

	/** Sends a DELETE request */
	delete<T>(url: string, config?: HttpRequestConfig): Promise<T>;
}
