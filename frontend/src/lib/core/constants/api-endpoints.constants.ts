/**
 * Centralized object for all application endpoints.
 * These are RELATIVE paths to `PUBLIC_API_URL`
 */

export const API_ENDPOINTS = {
	AUTH: {
		LOGIN: '/auth/login'
	},
	STUDENT: {
		COURSES: (semester: string) => `/student/courses/${semester}`,
		GRADES: (semester: string) => `/student/grades/${semester}`,
		SCHEDULE: (semester: string) => `/student/schedule/${semester}`,
		AVAILABLE_LABS: (enrollmentId: string) => `/student/enrollment/${enrollmentId}/available-labs`,
		ENROLL_LAB: '/student/enroll-lab',
		ENROLL_LABS: '/student/enroll-labs'
	},
	TEACHER: {
		GROUPS: (semester: string) => `/teacher/groups/${semester}`,
		SCHEDULE: (semester: string) => `/teacher/schedule/${semester}`,
		ROSTER: (groupId: string) => `/teacher/group/${groupId}/roster`,
		ROSTER_WITH_GRADES: (groupId: string) => `/teacher/group/${groupId}/roster-with-grades`,
		SAVE_BULK_GRADES: '/teacher/grades/save-bulk',
		TAKE_ATTENDANCE: '/teacher/attendance/take'
	}
};
