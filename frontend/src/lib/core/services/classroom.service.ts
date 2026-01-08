import type { IHttpClient } from '$lib/core/interfaces/http-client.interface';
import { httpClient } from '$lib/core/adapters';
import { API_ENDPOINTS } from '$lib/core/constants/api-endpoints.constants';
import type { Classroom, ClassroomScheduleEntry } from '$lib/core/domain/classroom.types';



/**
 * Application service for classroom-related use cases.
 */
class ClassroomService {
  constructor(private http: IHttpClient) { }

  /** Retrieves all available classrooms (labs and theory rooms) */
  public getAllClassrooms(): Promise<Classroom[]> {
    return this.http.get<Classroom[]>(API_ENDPOINTS.CLASSROOMS.GET_ALL);
  }

  public getSchedule(classroomId: string, semester: string): Promise<ClassroomScheduleEntry[]> {
    return this.http.get<ClassroomScheduleEntry[]>(`/classrooms/${classroomId}/schedule`, {
      params: { semester }
    });
  }

  public getClassroomSchedule(classroomId: string, semester: string): Promise<ClassroomScheduleEntry[]> {
    return this.http.get<ClassroomScheduleEntry[]>(
      API_ENDPOINTS.ADMIN.GET_CLASSROOM_SCHEDULE(classroomId),
      { params: { semester } }
    );
  }
}

/** Singleton instance of ClassroomService */
export const classroomService = new ClassroomService(httpClient);
