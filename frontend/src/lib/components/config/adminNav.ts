import type { NavGroup } from './types';

export const adminNavGroups: NavGroup[] = [
	{
		title: 'Gestión de Usuarios',
		items: [
			{
				title: 'Estudiantes',
				url: '/dashboard/admin/students'
			},
			{
				title: 'Profesores',
				url: '/dashboard/admin/professors'
			}
		]
	},
	{
		title: 'Gestión Académica',
		items: [
			{
				title: 'Cursos',
				url: '/dashboard/admin/courses'
			},
			{
				title: 'Supervisión de Labs',
				url: '/dashboard/admin/labs'
			}
		]
	},
	{
		title: 'Analíticas',
		items: [
			{
				title: 'Reportes de Cursos',
				url: '/dashboard/admin/reports/courses'
			},
			{
				title: 'Reportes de Asistencia',
				url: '/dashboard/admin/reports/attendance'
			},
			{
				title: 'Reportes de Calificaciones',
				url: '/dashboard/admin/reports/grades'
			}
		]
	}
];
