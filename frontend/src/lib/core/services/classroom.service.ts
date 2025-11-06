import type { IHttpClient } from '$lib/core/interfaces/http-client.interface';
import { httpClient } from '$lib/core/adapters';
import { API_ENDPOINTS } from '$lib/core/constants/api-endpoints.constants';
import type { Classroom } from '$lib/core/domain/classroom.types';

/**
 * Application service for classroom-related use cases.
 */
class ClassroomService {
	constructor(private http: IHttpClient) {}

	/** Retrieves all available classrooms (labs and theory rooms) */
	public getAllClassrooms(): Promise<Classroom[]> {
		return this.http.get<Classroom[]>(API_ENDPOINTS.CLASSROOMS.GET_ALL);
	}
}

/** Singleton instance of ClassroomService */
export const classroomService = new ClassroomService(httpClient);
