import type { UserRole } from './enums';

/**
 * Credentials for user login.
 */
export interface LoginCredentials {
	email: string;
	password: string;
}

/**
 * Represents an authenticated user session.
 */
export interface AuthSession {
	token: string;
	role: UserRole;
	profileId: string;
}
