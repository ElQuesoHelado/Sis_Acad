import type { HubGroup } from './hub.types';
import { APP_PATHS } from '$lib/utils/app-paths';
import { BookCopy, GraduationCap, Calendar } from '@lucide/svelte';

// TODO: Group student hubs properly for UX

/**
 * Defines the navigation cards shown in the Student Dashboard Hub.
 * Grouped by main academic functionalities.
 */
export const studentHubGroups: HubGroup[] = [
	{
		title: 'Gestión Académica',
		items: [
			{
				title: 'Mis Cursos',
				description: 'Consulta los cursos en los que estás matriculado este semestre.',
				url: APP_PATHS.STUDENT.COURSES,
				icon: BookCopy
			},
			{
				title: 'Mis Calificaciones',
				description: 'Revisa tus notas y tu promedio ponderado.',
				url: APP_PATHS.STUDENT.GRADES,
				icon: GraduationCap
			},
			{
				title: 'Mi Horario',
				description: 'Visualiza tu horario de clases y laboratorios.',
				url: APP_PATHS.STUDENT.SCHEDULE,
				icon: Calendar
			}
			// Future feature: enrollment screen
			// {
			//   title: 'Matrícula',
			//   description: 'Inscríbete en cursos para el próximo semestre.',
			//   url: APP_PATHS.STUDENT.ENROLLMENT,
			//   icon: PlusCircle
			// }
		]
	}
];
