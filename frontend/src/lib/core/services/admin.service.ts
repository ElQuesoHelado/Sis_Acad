import type { IHttpClient } from '$lib/core/interfaces/http-client.interface';
import { httpClient } from '$lib/core/adapters';
import { API_ENDPOINTS } from '$lib/core/constants/api-endpoints.constants';
import type { 
	AdminUserListEntry, 
	AdminTeacherDetails 
} from '$lib/core/domain/admin.types';
import type { StudentCourseGrades } from '$lib/core/domain/student.types';

class AdminService {
	constructor(private http: IHttpClient) {}

	public getAllUsers(): Promise<AdminUserListEntry[]> {
		return this.http.get<AdminUserListEntry[]>(API_ENDPOINTS.ADMIN.GET_USERS);
	}

	public getTeacherDetails(userId: string, semester: string): Promise<AdminTeacherDetails> {
		return this.http.get<AdminTeacherDetails>(
			API_ENDPOINTS.ADMIN.GET_TEACHER_DETAILS(userId, semester)
		);
	}

	public getStudentDetails(userId: string, semester: string): Promise<StudentCourseGrades[]> {
		return this.http.get<StudentCourseGrades[]>(
			API_ENDPOINTS.ADMIN.GET_STUDENT_DETAILS(userId, semester)
		);
	}
}

export const adminService = new AdminService(httpClient);
