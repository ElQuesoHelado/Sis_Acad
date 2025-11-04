import type { NavGroup } from './types';

export const professorNavGroups: NavGroup[] = [
	{
		title: 'Gestión de Cursos',
		items: [
			{
				title: 'Mis Cursos',
				url: '/dashboard/professor/courses'
			},
			{
				title: 'Ingresar Calificaciones',
				url: '/dashboard/professor/grades'
			},
			{
				title: 'Marcar Asistencia',
				url: '/dashboard/professor/attendance'
			}
		]
	},
	{
		title: 'Gestión de Laboratorios',
		items: [
			{
				title: 'Mis Grupos de Lab',
				url: '/dashboard/professor/labs'
			},
			{
				title: 'Reservas',
				url: '/dashboard/professor/reservations'
			}
		]
	},
	{
		title: 'Reportes',
		items: [
			{
				title: 'Reportes de Curso',
				url: '/dashboard/professor/reports'
			}
		]
	}
];
