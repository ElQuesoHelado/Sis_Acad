import type { ISessionStorage } from '$lib/core/interfaces/session-storage.interface';
import type { AuthSession, UserRole } from '$lib/core/domain';
import { TOKEN_KEY, ROLE_KEY, PROFILE_ID_KEY } from '$lib/core/constants/storage.constants';
import { userRoleStore } from '$lib/core/stores/user.store';

/**
 * Concrete implementation of ISessionStorage using localStorage.
 * Handles storing session data and notifying the Svelte store for reactivity.
 */
class LocalStorageSession implements ISessionStorage {
	public saveSession(data: AuthSession): void {
		if (!data.token || !data.role || !data.profileId) {
			console.error('Incomplete login response, session not saved.');
			return;
		}

		localStorage.setItem(TOKEN_KEY, data.token);
		localStorage.setItem(ROLE_KEY, data.role);
		localStorage.setItem(PROFILE_ID_KEY, data.profileId);

		// Notify the Svelte store for reactivity
		userRoleStore.set(data.role);
	}

	public clearSession(): void {
		localStorage.removeItem(TOKEN_KEY);
		localStorage.removeItem(ROLE_KEY);
		localStorage.removeItem(PROFILE_ID_KEY);

		userRoleStore.set(null);
	}

	public getToken(): string | null {
		if (typeof window === 'undefined') return null;
		return localStorage.getItem(TOKEN_KEY);
	}

	public getRole(): UserRole | null {
		if (typeof window === 'undefined') return null;
		return localStorage.getItem(ROLE_KEY) as UserRole | null;
	}

	public getProfileId(): string | null {
		if (typeof window === 'undefined') return null;
		return localStorage.getItem(PROFILE_ID_KEY);
	}
}

/** Singleton instance of LocalStorageSession */
export const sessionStorage = new LocalStorageSession();
