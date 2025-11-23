import type { Crumb } from '$lib/components/config/nav/nav.types';
import { APP_PATHS } from '$lib/utils/app-paths';
import { studentNavGroups } from '$lib/components/config/nav/student.nav';
import { studentHubGroups } from '$lib/components/config/hub/student.hub';
import { teacherNavGroups } from '$lib/components/config/nav/teacher.nav';
import { teacherHubGroups } from '$lib/components/config/hub/teacher.hub';

const pathLabelMap = new Map<string, string>();

// Mapas base
pathLabelMap.set(APP_PATHS.STUDENT.BASE, 'Inicio Estudiante');
pathLabelMap.set(APP_PATHS.TEACHER.BASE, 'Inicio Profesor');

function populateMap(items: { url: string; title: string }[]) {
	for (const item of items) {
		pathLabelMap.set(item.url, item.title);
	}
}

// Poblar con la configuración existente
studentNavGroups.forEach((group) => populateMap(group.items));
studentHubGroups.forEach((group) => populateMap(group.items));
teacherNavGroups.forEach((group) => populateMap(group.items));
teacherHubGroups.forEach((group) => populateMap(group.items));

/**
 * Construye las migas de pan (breadcrumbs) basadas en la URL actual.
 * Soporta rutas estáticas y patrones dinámicos específicos.
 */
export function buildCrumbs(pathname: string): Crumb[] {
	const crumbs: Crumb[] = [];
	const pathSegments = pathname.split('/').filter(Boolean);

	let currentPath = '';

	for (let i = 0; i < pathSegments.length; i++) {
		const segment = pathSegments[i];
		const prevSegment = i > 0 ? pathSegments[i - 1] : '';
		currentPath += `/${segment}`;

		// 1. Intentar coincidencia exacta en el mapa estático
		const label = pathLabelMap.get(currentPath);
		if (label) {
			crumbs.push({
				label: label,
				href: currentPath
			});
			continue;
		}

		// 2. Manejo de rutas dinámicas (Estudiante)
		
		// Caso: /dashboard/student/course -> Visualmente es "Mis Cursos"
		if (segment === 'course' && prevSegment === 'student') {
			crumbs.push({
				label: 'Mis Cursos',
				href: APP_PATHS.STUDENT.COURSES // Redirigir al listado, no a /course
			});
			continue;
		}

		// Caso: /dashboard/student/course/[id] -> ID del curso
		if (prevSegment === 'course') {
			crumbs.push({
				label: 'Curso', // Etiqueta genérica para el ID
				href: undefined // No clickable
			});
			continue;
		}

		// Casos específicos finales
		if (segment === 'syllabus' && pathSegments[i - 2] === 'course') {
			crumbs.push({ label: 'Sílabo', href: currentPath });
			continue;
		}
		
		if (segment === 'attendance' && pathSegments[i - 2] === 'course') {
			crumbs.push({ label: 'Asistencia', href: currentPath });
			continue;
		}
	}

	// Desactivar el enlace del último elemento (página actual)
	if (crumbs.length > 0) {
		crumbs[crumbs.length - 1].href = undefined;
	}

	return crumbs;
}
