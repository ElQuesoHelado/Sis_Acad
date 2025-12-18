import type { IHttpClient } from '$lib/core/interfaces/http-client.interface';
import { httpClient } from '$lib/core/adapters';
import { API_ENDPOINTS } from '$lib/core/constants/api-endpoints.constants';
import type { AdminUserListEntry, AdminTeacherDetails } from '$lib/core/domain/admin.types';
import type { StudentAttendanceReport, StudentCourseGrades } from '$lib/core/domain/student.types';

class SecretaryService {
  constructor(private http: IHttpClient) { }

  // Obtener solo estudiantes
  public getStudents(): Promise<AdminUserListEntry[]> {
    return this.http.get<AdminUserListEntry[]>(API_ENDPOINTS.SECRETARY.STUDENTS);
  }

  // Obtener solo profesores
  public getTeachers(): Promise<AdminUserListEntry[]> {
    return this.http.get<AdminUserListEntry[]>(API_ENDPOINTS.SECRETARY.TEACHERS);
  }

  // Ver detalles de un estudiante específico
  public getStudentDetails(userId: string, semester: string): Promise<StudentCourseGrades[]> {
    return this.http.get<StudentCourseGrades[]>(
      API_ENDPOINTS.SECRETARY.GET_STUDENT_DETAILS(userId, semester)
    );
  }

  // Ver detalles de un profesor específico
  public getTeacherDetails(userId: string, semester: string): Promise<AdminTeacherDetails> {
    return this.http.get<AdminTeacherDetails>(
      API_ENDPOINTS.SECRETARY.GET_TEACHER_DETAILS(userId, semester)
    );
  }

  public getAttendanceReport(enrollmentId: string): Promise<StudentAttendanceReport> {
    return this.http.get<StudentAttendanceReport>(
      `/secretary/attendance/${enrollmentId}`
    );
  }
}

export const secretaryService = new SecretaryService(httpClient);
