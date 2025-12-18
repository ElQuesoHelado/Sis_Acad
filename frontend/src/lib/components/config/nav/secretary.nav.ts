import { BookUser, GraduationCap, House } from "@lucide/svelte";
import type { NavGroup } from "./nav.types";
import { APP_PATHS } from "$lib/utils/app-paths";

export const secretaryNavGroups: NavGroup[] = [
  {
    items: [
      { title: 'Inicio', url: APP_PATHS.SECRETARY.BASE, icon: House },
      { title: 'Estudiantes', url: APP_PATHS.SECRETARY.STUDENTS, icon: GraduationCap },
      { title: 'Profesores', url: APP_PATHS.SECRETARY.TEACHERS, icon: BookUser },

    ]
  }
];
