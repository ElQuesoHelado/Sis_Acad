import type { HubGroup } from './hub.types';
import { APP_PATHS } from '$lib/utils/app-paths';
import { Users, CalendarCheck } from '@lucide/svelte';

export const secretaryHubGroups: HubGroup[] = [
	{
		title: 'Gestión Académica',
		items: [
			{
				title: 'Listado de Usuarios',
				description: 'Acceso a perfiles de alumnos y profesores.',
				url: APP_PATHS.SECRETARY.USERS,
				icon: Users
			},
			{
				title: 'Reportes de Asistencia',
				description: 'Consulta la asistencia detallada por matrícula.',
				url: APP_PATHS.SECRETARY.ATTENDANCE,
				icon: CalendarCheck
			}
		]
	}
];
