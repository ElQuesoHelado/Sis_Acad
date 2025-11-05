import { authService } from '$lib/core/services/auth.service';
import { APP_PATHS } from '$lib/utils/app-paths';
import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = () => {
	const userRole = authService.getUserRole();

	if (!userRole) {
		throw redirect(307, APP_PATHS.LOGIN);
	}

	return {
		userRole: userRole
	};
};
