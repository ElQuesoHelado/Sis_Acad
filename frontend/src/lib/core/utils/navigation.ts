import { goto } from '$app/navigation';
import type { UserRole } from '$lib/core/api/types';

type GotoOptions = {
	replaceState?: boolean;
	noScroll?: boolean;
	keepFocus?: boolean;
	invalidateAll?: boolean;
	state?: App.PageState;
};

export function roleRedirect(role: UserRole, options: GotoOptions = { replaceState: true }) {
	const normalizedRole = role.toLowerCase().trim();

	console.log(`Redirecting based on role: "${normalizedRole}"`);

	switch (normalizedRole) {
		case 'admin':
			goto('/dashboard/admin', options);
			break;
		case 'student':
			goto('/dashboard/student', options);
			break;
		case 'professor':
			goto('/dashboard/professor', options);
			break;
		case 'secretary':
			goto('/dashboard/secretary', options);
			break;
		default:
			console.warn(`Rol "${normalizedRole}" not recognized, fallback: /dashboard`);
			goto('/dashboard', options);
	}
}
