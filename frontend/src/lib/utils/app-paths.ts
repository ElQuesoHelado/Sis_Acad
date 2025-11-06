/**
 * Defines all internal routes of the SvelteKit application.
 */

const DASHBOARD_BASE = '/dashboard';
const STUDENT_BASE = `${DASHBOARD_BASE}/student`;
const TEACHER_BASE = `${DASHBOARD_BASE}/teacher`;

const PUBLIC_PATHS = {
	LOGIN: '/login',
	DASHBOARD: DASHBOARD_BASE
};

const STUDENT_PATHS = {
	BASE: STUDENT_BASE,
	COURSES: `${STUDENT_BASE}/courses`,
	GRADES: `${STUDENT_BASE}/grades`,
	SCHEDULE: `${STUDENT_BASE}/schedule`,
	ENROLLMENT: `${STUDENT_BASE}/enrollment`
};

const TEACHER_PATHS = {
	BASE: TEACHER_BASE,
	COURSES: `${TEACHER_BASE}/courses`,
	GRADES: `${TEACHER_BASE}/grades`,
	ATTENDANCE: `${TEACHER_BASE}/attendance`,
	SCHEDULE: `${TEACHER_BASE}/schedule`,
	RESERVE_CLASSROOM: `${TEACHER_BASE}/reserve-classroom`
};

/**
 * Immutable object centralizing all application routes.
 */
export const APP_PATHS = Object.freeze({
	...PUBLIC_PATHS,
	STUDENT: Object.freeze(STUDENT_PATHS),
	TEACHER: Object.freeze(TEACHER_PATHS)
});
