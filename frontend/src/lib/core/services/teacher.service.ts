import type {
	TeacherGroup,
	TeacherScheduleEntry,
	StudentRosterEntry,
	StudentRosterWithGrades,
	SaveBulkGradesInput,
	TakeAttendanceInput,
	ClassType
} from '$lib/core/domain';
import type { IHttpClient } from '$lib/core/interfaces/http-client.interface';
import { httpClient } from '$lib/core/adapters';
import { API_ENDPOINTS } from '$lib/core/constants/api-endpoints.constants';

/**
 * Application service for teacher use cases.
 */
class TeacherService {
	constructor(private http: IHttpClient) {}

	/** Retrieves all groups assigned to a teacher for a given semester */
	public getGroupsBySemester(semester: string): Promise<TeacherGroup[]> {
		return this.http.get<TeacherGroup[]>(API_ENDPOINTS.TEACHER.GROUPS(semester));
	}

	/** Retrieves the schedule for a teacher in a given semester */
	public getScheduleBySemester(semester: string): Promise<TeacherScheduleEntry[]> {
		return this.http.get<TeacherScheduleEntry[]>(API_ENDPOINTS.TEACHER.SCHEDULE(semester));
	}

	/** Retrieves the student roster for a specific group and class type */
	public getStudentRoster(groupId: string, type: ClassType): Promise<StudentRosterEntry[]> {
		return this.http.get<StudentRosterEntry[]>(API_ENDPOINTS.TEACHER.ROSTER(groupId), {
			params: { type }
		});
	}

	/** Retrieves the student roster along with grades for a specific group and class type */
	public getRosterWithGrades(groupId: string, type: ClassType): Promise<StudentRosterWithGrades[]> {
		return this.http.get<StudentRosterWithGrades[]>(
			API_ENDPOINTS.TEACHER.ROSTER_WITH_GRADES(groupId),
			{ params: { type } }
		);
	}

	/** Saves multiple student grades in bulk */
	public saveBulkGrades(data: SaveBulkGradesInput): Promise<void> {
		return this.http.post<void>(API_ENDPOINTS.TEACHER.SAVE_BULK_GRADES, data);
	}

	/** Submits attendance records for a class session */
	public takeAttendance(data: TakeAttendanceInput): Promise<void> {
		return this.http.post<void>(API_ENDPOINTS.TEACHER.TAKE_ATTENDANCE, data);
	}
}

/** Singleton instance of TeacherService */
export const teacherService = new TeacherService(httpClient);
