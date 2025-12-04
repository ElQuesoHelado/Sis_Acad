import type { NavGroup } from './nav.types';
import { APP_PATHS } from '$lib/utils/app-paths';
import { House, Users } from '@lucide/svelte';

export const adminNavGroups: NavGroup[] = [
	{
		items: [
			{
				title: 'Inicio',
				url: APP_PATHS.ADMIN.BASE,
				icon: House
			},
			{
				title: 'Usuarios',
				url: APP_PATHS.ADMIN.USERS,
				icon: Users
			}
		]
	}
];
