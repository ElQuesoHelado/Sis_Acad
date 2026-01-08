import type { HubGroup } from './hub.types';
import { APP_PATHS } from '$lib/utils/app-paths';
import { GraduationCap, BookUser, CalendarCheck, FlaskConical } from '@lucide/svelte';

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
      },
      {
        title: 'Laboratorios',
        description: 'Creación y administración de grupos de laboratorio.',
        url: APP_PATHS.SECRETARY.LABS,
        icon: FlaskConical
      },
      {
        title: 'Periodo de Matrícula',
        description: 'Configuración de fechas para la inscripción a laboratorios.',
        url: APP_PATHS.SECRETARY.ENROLLMENT_PERIOD,
        icon: CalendarCheck
      }
    ]
  }
];
