import type { NavGroup } from './nav.types';
import { APP_PATHS } from '$lib/utils/app-paths';
import { Building2, House, Users } from '@lucide/svelte';

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
			},
      { 
        title: 'Horarios por Salón', 
        url: `${APP_PATHS.ADMIN.BASE}/classrooms/schedule`, // Ruta que crearemos abajo
        icon: Building2
      }
		]
	}
];
