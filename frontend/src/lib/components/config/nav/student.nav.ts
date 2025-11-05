import type { NavGroup } from './nav.types';
import { APP_PATHS } from '$lib/utils/app-paths';
import { House } from '@lucide/svelte';

/**
 * Defines the main Student sidebar navigation.
 */
export const studentNavGroups: NavGroup[] = [
  {
    items: [
      {
        title: 'Inicio',
        url: APP_PATHS.STUDENT.BASE,
        icon: House
      }
    ]
  }

  // Future example of a separate group
  // {
  //   title: 'Ajustes',
  //   items: [
  //     { title: 'Perfil', url: '...', icon: ... },
  //   ]
  // }
];

