import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { UserResponse } from '$lib/core/services/types';

type UserStoreState = UserResponse | null;

/**
 * Manages the user authentication state using a Svelte store
 * and persists it to localStorage.
 */
class UserAuthStore {
	// The core Svelte store, kept private
	private store: Writable<UserStoreState>;

	constructor() {
		const initialValue = browser
			? (JSON.parse(localStorage.getItem('user') || 'null') as UserStoreState)
			: null;
		this.store = writable<UserStoreState>(initialValue);

		if (browser) {
			this.setupPersistence();
		}
	}

	// Make the store readable publicly (provides subscribe method)
	public get subscribe() {
		return this.store.subscribe;
	}

	/**
	 * Sets up the subscription to automatically save user state to localStorage
	 * and clear the auth token on logout. Runs only in the browser.
	 */
	private setupPersistence(): void {
		this.store.subscribe((value) => {
			if (browser) {
				if (value) {
					localStorage.setItem('user', JSON.stringify(value));
				} else {
					localStorage.removeItem('user');
					if (localStorage.getItem('authToken')) {
						console.log('User store set to null, removing authToken from localStorage.');
						localStorage.removeItem('authToken');
						// Redirect if logout happens unexpectedly
						// if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
						//    window.location.href = '/login';
						// }
					}
				}
			}
		});
	}

	/**
	 * Updates the store with new user data (typically after login).
	 * @param userData The user data to set.
	 */
	public setUser(userData: UserResponse): void {
		this.store.set(userData);
	}

	/**
	 * Updates parts of the user data in the store.
	 * Useful for profile updates without a full refresh.
	 * @param updateFn A function that receives the current user state and returns the updated state.
	 */
	public updateUser(updateFn: (current: UserStoreState) => UserStoreState): void {
		this.store.update(updateFn);
	}

	/**
	 * Clears the user data from the store and localStorage (logs the user out).
	 * Also clears the associated authToken from localStorage via the subscriber.
	 */
	public logout(): void {
		this.store.set(null);
	}
}

// Create a single instance of the store to be used throughout the application.
const userStore = new UserAuthStore();

export default userStore;
