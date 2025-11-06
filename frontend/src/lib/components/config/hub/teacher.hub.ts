import type { HubGroup } from './hub.types';
import { APP_PATHS } from '$lib/utils/app-paths';
import { Users, ClipboardCheck, BookOpenCheck, Calendar, CalendarPlus } from '@lucide/svelte';

// TODO: Group teacher hubs properly for UX

/**
 * Teacher dashboard hub cards.
 * Groups features in the "Gestión Académica" section.
 */
export const teacherHubGroups: HubGroup[] = [
	{
		title: 'Gestión Académica',
		items: [
			// {
			// 	title: 'Mis Grupos',
			// 	description: 'Gestionar los grupos de curso que tienes asignados.',
			// 	url: APP_PATHS.TEACHER.COURSES,
			// 	icon: Users
			// },
			{
				title: 'Ingresar Calificaciones',
				description: 'Registrar y modificar las notas de tus estudiantes.',
				url: APP_PATHS.TEACHER.GRADES,
				icon: ClipboardCheck
			},
			{
				title: 'Marcar Asistencia',
				description: 'Llevar un registro de la asistencia a tus sesiones.',
				url: APP_PATHS.TEACHER.ATTENDANCE,
				icon: BookOpenCheck
			},
			{
				title: 'Mi Horario',
				description: 'Visualizar tu horario de dictado de clases.',
				url: APP_PATHS.TEACHER.SCHEDULE,
				icon: Calendar
			},
			{
				title: 'Reservar Salón',
				description: 'Reserva un aula o laboratorio para una sesión especial.',
				url: APP_PATHS.TEACHER.RESERVE_CLASSROOM,
				icon: CalendarPlus
			}
		]
	}
	// Future report services (e.g., statistics, performance) can be added here:
	// {
	// 	title: 'Reportes y Estadísticas',
	// 	items: [
	// 		{
	// 			title: 'Desempeño de Estudiantes',
	// 			description: 'Ver gráficos y estadísticas de tus grupos.',
	// 			url: APP_PATHS.TEACHER.REPORTS_PERFORMANCE, // needs to be added to app-paths.ts
	// 			icon: PieChart
	// 		}
	// 	]
	// }
];
