/**
 * Defines all internal routes of the SvelteKit application.
 */

const DASHBOARD_BASE = '/dashboard';
const STUDENT_BASE = `${DASHBOARD_BASE}/student`;
const TEACHER_BASE = `${DASHBOARD_BASE}/teacher`;
const ADMIN_BASE = `${DASHBOARD_BASE}/admin`;
const SECRETARY_BASE = `${DASHBOARD_BASE}/secretary`;

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

const ADMIN_PATHS = {
  BASE: ADMIN_BASE,
  USERS: `${ADMIN_BASE}/users`
};

const SECRETARY_PATHS = {
  BASE: SECRETARY_BASE,
  USERS: `${SECRETARY_BASE}/users`,
  STUDENTS: `${SECRETARY_BASE}/students`,
  TEACHERS: `${SECRETARY_BASE}/teachers`,
  ATTENDANCE: `${SECRETARY_BASE}/attendance`,
  LABS: `${SECRETARY_BASE}/labs`,
  ENROLLMENT_PERIOD: `${SECRETARY_BASE}/enrollment-period`
};

/**
 * Immutable object centralizing all application routes.
 */
export const APP_PATHS = Object.freeze({
  ...PUBLIC_PATHS,
  STUDENT: Object.freeze(STUDENT_PATHS),
  TEACHER: Object.freeze(TEACHER_PATHS),
  ADMIN: Object.freeze(ADMIN_PATHS),
  SECRETARY: Object.freeze(SECRETARY_PATHS)
});
