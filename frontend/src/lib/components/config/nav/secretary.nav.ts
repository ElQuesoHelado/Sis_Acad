import type { NavGroup } from './nav.types';
import { APP_PATHS } from '$lib/utils/app-paths';
import { House, Users, CalendarCheck } from '@lucide/svelte';

export const secretaryNavGroups: NavGroup[] = [
	{
		items: [
			{
				title: 'Inicio',
				url: APP_PATHS.SECRETARY.BASE,
				icon: House
			},
			{
				title: 'Usuarios',
				url: APP_PATHS.SECRETARY.USERS,
				icon: Users
			},
			{
				title: 'Asistencia',
				url: APP_PATHS.SECRETARY.ATTENDANCE,
				icon: CalendarCheck
			}
		]
	}
];
