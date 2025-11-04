import type {
	TeacherGroup,
	TeacherScheduleEntry,
	StudentRosterEntry,
	StudentRosterWithGrades,
	SaveBulkGradesInput,
	TakeAttendanceInput,
	ClassType
} from '$lib/core/api/types';
import api from './axios';

const BASE_URL = '/api/teacher';

/**
 * Collection of API calls available for the Teacher role.
 */
export const teacherService = {
	/**
	 * Retrieves all teaching groups for a given semester.
	 * GET /api/teacher/groups/{semester}
	 */
	getGroupsBySemester: async (semester: string): Promise<TeacherGroup[]> => {
		const response = await api.get<TeacherGroup[]>(`${BASE_URL}/groups/${semester}`);
		return response.data;
	},

	/**
	 * Retrieves the teacher's schedule for a given semester.
	 * GET /api/teacher/schedule/{semester}
	 */
	getScheduleBySemester: async (semester: string): Promise<TeacherScheduleEntry[]> => {
		const response = await api.get<TeacherScheduleEntry[]>(`${BASE_URL}/schedule/${semester}`);
		return response.data;
	},

	/**
	 * Retrieves the student roster for a given group.
	 * GET /api/teacher/group/{groupId}/roster
	 */
	getStudentRoster: async (groupId: string, type: ClassType): Promise<StudentRosterEntry[]> => {
		const response = await api.get<StudentRosterEntry[]>(`${BASE_URL}/group/${groupId}/roster`, {
			params: { type }
		});
		return response.data;
	},

	/**
	 * Retrieves the student roster with grade details for a given group.
	 * GET /api/teacher/group/{groupId}/roster-with-grades
	 */
	getRosterWithGrades: async (
		groupId: string,
		type: ClassType
	): Promise<StudentRosterWithGrades[]> => {
		const response = await api.get<StudentRosterWithGrades[]>(
			`${BASE_URL}/group/${groupId}/roster-with-grades`,
			{
				params: { type }
			}
		);
		return response.data;
	},

	/**
	 * Saves multiple grade entries at once.
	 * POST /api/teacher/grades/save-bulk
	 */
	saveBulkGrades: async (data: SaveBulkGradesInput): Promise<void> => {
		await api.post(`${BASE_URL}/grades/save-bulk`, data);
	},

	/**
	 * Submits attendance for a specific date and group.
	 * POST /api/teacher/attendance/take
	 */
	takeAttendance: async (data: TakeAttendanceInput): Promise<void> => {
		await api.post(`${BASE_URL}/attendance/take`, data);
	}
};
