import type {
	StudentCourse,
	StudentCourseGrades,
	StudentScheduleEntry,
	AvailableLabGroup,
	EnrollInLabGroupInput,
	EnrollInLabGroupsInput
} from '$lib/core/api/types';
import api from './axios';

const BASE_URL = '/api/student';

/**
 * Collection of API calls available for the Student role.
 */
export const studentService = {
	/**
	 * Retrieves all courses for a student in a given semester.
	 * GET /api/student/courses/{semester}
	 */
	getCoursesBySemester: async (semester: string): Promise<StudentCourse[]> => {
		const response = await api.get<StudentCourse[]>(`${BASE_URL}/courses/${semester}`);
		return response.data;
	},

	/**
	 * Retrieves the student's grades for a given semester.
	 * GET /api/student/grades/{semester}
	 */
	getGradesBySemester: async (semester: string): Promise<StudentCourseGrades[]> => {
		const response = await api.get<StudentCourseGrades[]>(`${BASE_URL}/grades/${semester}`);
		return response.data;
	},

	/**
	 * Retrieves the student's schedule for a given semester.
	 * GET /api/student/schedule/{semester}
	 */
	getScheduleBySemester: async (semester: string): Promise<StudentScheduleEntry[]> => {
		const response = await api.get<StudentScheduleEntry[]>(`${BASE_URL}/schedule/${semester}`);
		return response.data;
	},

	/**
	 * Retrieves available lab groups for a specific enrollment.
	 * GET /api/student/enrollment/{enrollmentId}/available-labs
	 */
	getAvailableLabGroups: async (enrollmentId: string): Promise<AvailableLabGroup[]> => {
		const response = await api.get<AvailableLabGroup[]>(
			`${BASE_URL}/enrollment/${enrollmentId}/available-labs`
		);
		return response.data;
	},

	/**
	 * Enrolls the student in a single lab group.
	 * PATCH /api/student/enroll-lab
	 */
	enrollInLabGroup: async (data: EnrollInLabGroupInput): Promise<void> => {
		await api.patch(`${BASE_URL}/enroll-lab`, data);
	},

	/**
	 * Enrolls the student in multiple lab groups at once.
	 * POST /api/student/enroll-labs
	 */
	enrollInLabGroups: async (data: EnrollInLabGroupsInput): Promise<void> => {
		await api.post(`${BASE_URL}/enroll-labs`, data);
	}
};
