import type { NavGroup } from './nav.types';
import { APP_PATHS } from '$lib/utils/app-paths';
import { House } from '@lucide/svelte';

/**
 * Defines the main Teacher sidebar navigation.
 */
export const teacherNavGroups: NavGroup[] = [
	{
		items: [
			{
				title: 'Home',
				url: APP_PATHS.TEACHER.BASE,
				icon: House
			}
		]
	}
];
