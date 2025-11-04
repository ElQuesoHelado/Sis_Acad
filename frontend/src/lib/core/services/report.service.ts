import { ApiService } from './api.service';
import type { CourseReportResponse, StudentProgressReportResponse } from './types';

/**
 * Service class for generating and retrieving complex reports.
 */
export class ReportService {
	/**
	 * Generates a comprehensive report for a specific course, including student performance,
	 * attendance, content progress, and statistics.
	 * Corresponds to: GET /reports/course/{courseId}
	 * Requires Professor/Admin/Secretary permissions.
	 * @param courseId - The UUID of the course.
	 * @returns A promise that resolves with the detailed CourseReportResponse object.
	 */
	static async getCourseReport(courseId: string): Promise<CourseReportResponse> {
		return ApiService.get<CourseReportResponse>(`/reports/course/${courseId}`);
	}

	/**
	 * Generates a progress report for a specific student within a specific course,
	 * covering grades, attendance, and content completion.
	 * Corresponds to: GET /reports/student/{studentId}/course/{courseId}
	 * Accessible by the student, course professor, Admin, Secretary.
	 * @param studentId - The UUID of the student.
	 * @param courseId - The UUID of the course.
	 * @returns A promise that resolves with the StudentProgressReportResponse object.
	 */
	static async getStudentProgressReport(
		studentId: string,
		courseId: string
	): Promise<StudentProgressReportResponse> {
		return ApiService.get<StudentProgressReportResponse>(
			`/reports/student/${studentId}/course/${courseId}`
		);
	}
}
