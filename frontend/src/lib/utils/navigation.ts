import { goto } from '$app/navigation';
import { UserRole } from '$lib/core/domain';
import { APP_PATHS } from './app-paths';

type GotoOptions = {
	replaceState?: boolean;
	noScroll?: boolean;
	keepFocus?: boolean;
	invalidateAll?: boolean;
	state?: App.PageState;
};

/**
 * Redirects a user to their role-specific dashboard.
 *
 * @param role - The role of the authenticated user.
 * @param options - Optional navigation settings for `goto`.
 */
export function roleRedirect(role: UserRole | null, options: GotoOptions = { replaceState: true }) {
	switch (role) {
		// case UserRole.ADMIN:
		// 	goto(APP_PATHS.DASHBOARD_ADMIN, options);
		// 	break;
		case UserRole.STUDENT:
			goto(APP_PATHS.STUDENT.BASE, options);
			break;
		case UserRole.PROFESSOR:
			goto(APP_PATHS.TEACHER.BASE, options);
			break;
		// case UserRole.SECRETARY:
		// 	goto(APP_PATHS.DASHBOARD_SECRETARY, options);
		// 	break;
		default:
			goto(APP_PATHS.LOGIN, options);
	}
}
