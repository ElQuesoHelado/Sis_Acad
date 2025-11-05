import type { LoginCredentials, AuthSession, UserRole } from '$lib/core/domain';
import type { IHttpClient } from '$lib/core/interfaces/http-client.interface';
import type { ISessionStorage } from '$lib/core/interfaces/session-storage.interface';
import { httpClient, sessionStorage } from '$lib/core/adapters';
import { API_ENDPOINTS } from '$lib/core/constants/api-endpoints.constants';

/**
 * High-level service for authentication use cases.
 * Consumes abstractions injected as concrete implementations.
 */
class AuthService {
	constructor(
		private http: IHttpClient,
		private session: ISessionStorage
	) {}

	/**
	 * Performs login with given credentials.
	 * Saves the session via the session adapter.
	 */
	public async login(credentials: LoginCredentials): Promise<AuthSession> {
		const sessionData = await this.http.post<AuthSession>(API_ENDPOINTS.AUTH.LOGIN, credentials, {
			meta: { noAuthRedirect: true }
		});
		this.session.saveSession(sessionData);
		return sessionData;
	}

	/**
	 * Logs out the user.
	 * Only clears the session; UI reacts and handles redirection.
	 */
	public logout(): void {
		this.session.clearSession();
	}

	/** Returns the role of the authenticated user */
	public getUserRole(): UserRole | null {
		return this.session.getRole();
	}

	/** Returns the profile ID of the authenticated user */
	public getUserProfileId(): string | null {
		return this.session.getProfileId();
	}

	/** Returns the JWT token of the authenticated user */
	public getToken(): string | null {
		return this.session.getToken();
	}
}

/** Singleton instance of AuthService with concrete implementations injected */
export const authService = new AuthService(httpClient, sessionStorage);
