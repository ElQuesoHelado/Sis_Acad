import type { NavGroup } from './types';

export const studentNavGroups: NavGroup[] = [
	{
		title: 'Académico',
		items: [
			{
				title: 'Mis Cursos',
				url: '/dashboard/student/courses'
			},
			{
				title: 'Mis Calificaciones',
				url: '/dashboard/student/grades'
			},
			{
				title: 'Mi Asistencia',
				url: '/dashboard/student/attendance'
			}
		]
	},
	{
		title: 'Reportes',
		items: [
			{
				title: 'Reporte de Progreso',
				url: '/dashboard/student/reports/progress'
			}
		]
	}
];
