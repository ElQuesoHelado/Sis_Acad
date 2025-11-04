import axios from 'axios';
import { axiosInstance, type CustomAxiosConfig } from './axios';
import type { ApiErrorResponse } from './types';

/**
 * Provides a base layer for making API calls using an Axios instance.
 * Includes centralized error handling.
 */
export class ApiService {
	/**
	 * Centralized error handler for API calls. Parses Axios errors and network issues.
	 * @param error - The error object caught from the Axios call.
	 * @throws {Error} Throws a new Error with a user-friendly message.
	 */
	private static handleError(error: unknown): never {
		// Handle network errors, client-side only
		if (typeof navigator !== 'undefined' && !navigator.onLine) {
			throw new Error('No internet connection. Please check your network and try again.');
		}

		if (axios.isAxiosError(error) && error.response) {
			const status = error.response.status;
			const errorData = error.response.data as Partial<ApiErrorResponse>;

			// Try to get a specific message from the backend response
			const backendMessage = errorData?.message;
			if (backendMessage && typeof backendMessage === 'string') {
				throw new Error(backendMessage);
			}

			// Generic error for specific HTTP statuses if no message provided
			switch (status) {
				case 400:
					throw new Error('Bad request. Please check the data you provided.');
				case 401:
					throw new Error('Your session has expired. Please log in again.');
				case 403:
					throw new Error('Forbidden. You do not have permission to perform this action.');
				case 404:
					throw new Error('Resource not found.');
				case 500:
					throw new Error('Internal server error. Please try again later.');
				default:
					throw new Error(`Request failed with status ${status}. Please try again.`);
			}
		} else if (axios.isAxiosError(error) && error.request) {
			console.error('API request error: No response received.', error.request);
			throw new Error(
				'Could not reach the server. Please check your connection or try again later.'
			);
		} else {
			console.error('Unexpected error during API call setup:', error);
			if (error instanceof Error) {
				throw new Error(`An unexpected error occurred: ${error.message}`);
			}
			throw new Error('An unexpected error occurred.');
		}
	}

	/**
	 * Performs a GET request.
	 * @param url - The endpoint URL (relative to the base URL).
	 * @param config - Optional Axios request configuration.
	 * @returns A promise that resolves with the response data.
	 */
	static async get<T>(url: string, config?: CustomAxiosConfig): Promise<T> {
		try {
			const response = await axiosInstance.get<T>(url, config);
			return response.data;
		} catch (error) {
			throw ApiService.handleError(error);
		}
	}

	/**
	 * Performs a POST request.
	 * @param url - The endpoint URL.
	 * @param payload - The data to send in the request body.
	 * @param config - Optional Axios request configuration.
	 * @returns A promise that resolves with the response data.
	 */
	static async post<T>(url: string, payload: unknown, config?: CustomAxiosConfig): Promise<T> {
		try {
			const response = await axiosInstance.post<T>(url, payload, config);
			return response.data;
		} catch (error) {
			throw ApiService.handleError(error);
		}
	}

	/**
	 * Performs a PUT request.
	 * @param url - The endpoint URL.
	 * @param payload - The data to send in the request body.
	 * @param config - Optional Axios request configuration.
	 * @returns A promise that resolves with the response data.
	 */
	static async put<T>(url: string, payload: unknown, config?: CustomAxiosConfig): Promise<T> {
		try {
			const response = await axiosInstance.put<T>(url, payload, config);
			return response.data;
		} catch (error) {
			throw ApiService.handleError(error);
		}
	}

	/**
	 * Performs a PATCH request.
	 * @param url - The endpoint URL.
	 * @param payload - The data to send in the request body.
	 * @param config - Optional Axios request configuration.
	 * @returns A promise that resolves with the response data.
	 */
	static async patch<T>(url: string, payload: unknown, config?: CustomAxiosConfig): Promise<T> {
		try {
			const response = await axiosInstance.patch<T>(url, payload, config);
			return response.data;
		} catch (error) {
			throw ApiService.handleError(error);
		}
	}

	/**
	 * Performs a DELETE request.
	 * @param url - The endpoint URL.
	 * @param config - Optional Axios request configuration.
	 * @returns A promise that resolves with the response data.
	 */
	static async delete<T>(url: string, config?: CustomAxiosConfig): Promise<T> {
		try {
			const response = await axiosInstance.delete<T>(url, config);
			return response.data;
		} catch (error) {
			throw ApiService.handleError(error);
		}
	}
}
