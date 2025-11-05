// CAMBIO: Importamos 'Crumb' desde el archivo .ts correcto
import type { Crumb } from '$lib/components/config/nav/nav.types';
import { APP_PATHS } from '$lib/utils/app-paths';
import { studentNavGroups } from '$lib/components/config/nav/student.nav';
import { studentHubGroups } from '$lib/components/config/hub/student.hub';
import { teacherNavGroups } from '$lib/components/config/nav/teacher.nav';
import { teacherHubGroups } from '$lib/components/config/hub/teacher.hub';

const pathLabelMap = new Map<string, string>();
pathLabelMap.set(APP_PATHS.STUDENT.BASE, 'Inicio Estudiante');
pathLabelMap.set(APP_PATHS.TEACHER.BASE, 'Inicio Profesor');
function populateMap(items: { url: string; title: string }[]) {
	for (const item of items) {
		pathLabelMap.set(item.url, item.title);
	}
}
studentNavGroups.forEach((group) => populateMap(group.items));
studentHubGroups.forEach((group) => populateMap(group.items));
teacherNavGroups.forEach((group) => populateMap(group.items));
teacherHubGroups.forEach((group) => populateMap(group.items));

export function buildCrumbs(pathname: string): Crumb[] {
	const crumbs: Crumb[] = [];
	const pathSegments = pathname.split('/').filter(Boolean);

	let currentPath = '';
	for (const segment of pathSegments) {
		currentPath += `/${segment}`;

		const label = pathLabelMap.get(currentPath);
		if (label) {
			crumbs.push({
				label: label,
				href: currentPath
			});
		}
	}

	if (crumbs.length > 0) {
		crumbs[crumbs.length - 1].href = undefined;
	}

	return crumbs;
}
