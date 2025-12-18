import type { HubGroup } from './hub.types';
import { APP_PATHS } from '$lib/utils/app-paths';
import { GraduationCap, BookUser, CalendarCheck } from '@lucide/svelte';

export const secretaryHubGroups: HubGroup[] = [
  {
    title: 'Gestión Académica',
    items: [
      {
        title: 'Estudiantes',
        description: 'Gestión de matrículas, visualización de notas y reportes de asistencia.',
        url: APP_PATHS.SECRETARY.STUDENTS,
        icon: GraduationCap
      },
      {
        title: 'Profesores',
        description: 'Carga académica y horarios docentes.',
        url: APP_PATHS.SECRETARY.TEACHERS,
        icon: BookUser
      }
    ]
  }
];
