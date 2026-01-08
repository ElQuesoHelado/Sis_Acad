import type { HubGroup } from './hub.types';
import { APP_PATHS } from '$lib/utils/app-paths';
import { Building2, Users } from '@lucide/svelte';

export const adminHubGroups: HubGroup[] = [
  {
    title: 'Administración del Sistema',
    items: [
      {
        title: 'Gestión de Usuarios',
        description: 'Visualiza el listado global de profesores, estudiantes y personal administrativo.',
        url: APP_PATHS.ADMIN.USERS,
        icon: Users
      },
      {
        title: 'Horarios por Salón',
        description: 'Visualiza los horarios de cada aula',
        url: `${APP_PATHS.ADMIN.BASE}/classrooms/schedule`,
        icon: Building2
      }
    ]
  }
];
