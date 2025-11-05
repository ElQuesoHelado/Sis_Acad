import type {
	StudentCourse,
	StudentCourseGrades,
	StudentScheduleEntry,
	AvailableLabGroup,
	EnrollInLabGroupInput,
	EnrollInLabGroupsInput
} from '$lib/core/domain';
import type { IHttpClient } from '$lib/core/interfaces/http-client.interface';
import { httpClient } from '$lib/core/adapters';
import { API_ENDPOINTS } from '$lib/core/constants/api-endpoints.constants';

/**
 * Application service for student use cases.
 */
class StudentService {
	constructor(private http: IHttpClient) {}

	/** Retrieves all courses for a student in a given semester */
	public getCoursesBySemester(semester: string): Promise<StudentCourse[]> {
		return this.http.get<StudentCourse[]>(API_ENDPOINTS.STUDENT.COURSES(semester));
	}

	/** Retrieves all grades for a student in a given semester */
	public getGradesBySemester(semester: string): Promise<StudentCourseGrades[]> {
		return this.http.get<StudentCourseGrades[]>(API_ENDPOINTS.STUDENT.GRADES(semester));
	}

	/** Retrieves the schedule for a student in a given semester */
	public getScheduleBySemester(semester: string): Promise<StudentScheduleEntry[]> {
		return this.http.get<StudentScheduleEntry[]>(API_ENDPOINTS.STUDENT.SCHEDULE(semester));
	}

	/** Retrieves available lab groups for a specific enrollment */
	public getAvailableLabGroups(enrollmentId: string): Promise<AvailableLabGroup[]> {
		return this.http.get<AvailableLabGroup[]>(API_ENDPOINTS.STUDENT.AVAILABLE_LABS(enrollmentId));
	}

	/** Enrolls the student in a single lab group */
	public enrollInLabGroup(data: EnrollInLabGroupInput): Promise<void> {
		return this.http.patch<void>(API_ENDPOINTS.STUDENT.ENROLL_LAB, data);
	}

	/** Enrolls the student in multiple lab groups */
	public enrollInLabGroups(data: EnrollInLabGroupsInput): Promise<void> {
		return this.http.post<void>(API_ENDPOINTS.STUDENT.ENROLL_LABS, data);
	}
}

/** Singleton instance of StudentService */
export const studentService = new StudentService(httpClient);
