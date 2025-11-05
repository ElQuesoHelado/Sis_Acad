import { authService } from '$lib/core/services/auth.service';
import { roleRedirect } from '$lib/utils/navigation';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	const userRole = authService.getUserRole();
	roleRedirect(userRole);
	return {};
};
