import type { UserRole } from './enums';

/**
 * Request type for POST /api/auth/login
 *
 */
export interface LoginRequest {
	email: string;
	password: string;
}

/**
 * Response type for POST /api/auth/login
 *
 */
export interface LoginResponse {
	token: string;
	role: UserRole;
	profileId: string;
}
