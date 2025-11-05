import type { AuthSession, UserRole } from '$lib/core/domain';

/**
 * Defines a contract for session storage management.
 */
export interface ISessionStorage {
	/** Saves the current user session */
	saveSession(data: AuthSession): void;

	/** Clears the current user session */
	clearSession(): void;

	/** Returns the stored JWT token, or null if none */
	getToken(): string | null;

	/** Returns the stored user role, or null if none */
	getRole(): UserRole | null;

	/** Returns the stored profile ID, or null if none */
	getProfileId(): string | null;
}
