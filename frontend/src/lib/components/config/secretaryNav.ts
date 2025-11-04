import type { NavGroup } from './types';

export const secretaryNavGroups: NavGroup[] = [
	{
		title: 'Gestión de Matrículas',
		items: [
			{
				title: 'Matricular Estudiante',
				url: '/dashboard/secretary/enrollments/new'
			},
			{
				title: 'Matrícula Masiva',
				url: '/dashboard/secretary/enrollments/bulk'
			},
			{
				title: 'Ver Matrículas',
				url: '/dashboard/secretary/enrollments'
			}
		]
	},
	{
		title: 'Gestión de Laboratorios',
		items: [
			{
				title: 'Gestionar Grupos',
				url: '/dashboard/secretary/labs'
			},
			{
				title: 'Aprobar Reservas',
				url: '/dashboard/secretary/reservations'
			}
		]
	}
];
