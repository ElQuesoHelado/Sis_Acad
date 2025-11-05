import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { UserRole } from '$lib/core/domain';
import { ROLE_KEY } from '$lib/core/constants/storage.constants';

/**
 * Reads the initial user role from localStorage, only in the browser.
 */
function getInitialRole(): UserRole | null {
	if (!browser) return null;
	return (localStorage.getItem(ROLE_KEY) as UserRole) || null;
}

/**
 * Simple reactive store containing the user's role.
 * Updated externally by the SessionStorage adapter.
 */
export const userRoleStore = writable<UserRole | null>(getInitialRole());
