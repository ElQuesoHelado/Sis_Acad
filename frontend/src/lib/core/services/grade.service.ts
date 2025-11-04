import { ApiService } from './api.service';
import type {
	GradeResponse,
	EnterGradeRequest,
	StudentGradesResponse,
	CourseGradeReportItem,
	GradeStatistics
} from './types';

/**
 * Service class for managing student grades.
 */
export class GradeService {
	/**
	 * Enters a grade for a student in a specific course.
	 * Corresponds to: POST /grades
	 * Requires Professor permissions for the associated course.
	 * @param gradeData - The details of the grade to be entered.
	 * @returns A promise that resolves with the created GradeResponse object.
	 */
	static async enterGrade(gradeData: EnterGradeRequest): Promise<GradeResponse> {
		return ApiService.post<GradeResponse>('/grades', gradeData);
	}

	/**
	 * Retrieves all grades for a specific student within a specific course, including the final calculated grade.
	 * Corresponds to: GET /grades/student/{studentId}/course/{courseId}
	 * Accessible by the student, the course professor, Admin, Secretary.
	 * @param studentId - The UUID of the student.
	 * @param courseId - The UUID of the course.
	 * @returns A promise that resolves with the StudentGradesResponse object.
	 */
	static async getStudentGradesForCourse(
		studentId: string,
		courseId: string
	): Promise<StudentGradesResponse> {
		return ApiService.get<StudentGradesResponse>(`/grades/student/${studentId}/course/${courseId}`);
	}

	/**
	 * Retrieves a detailed grade report for all students enrolled in a specific course.
	 * Corresponds to: GET /grades/course/{courseId}/report
	 * Requires Professor/Admin/Secretary permissions.
	 * @param courseId - The UUID of the course.
	 * @returns A promise that resolves with an array of CourseGradeReportItem objects.
	 */
	static async getCourseGradeReport(courseId: string): Promise<CourseGradeReportItem[]> {
		return ApiService.get<CourseGradeReportItem[]>(`/grades/course/${courseId}/report`);
	}

	/**
	 * Retrieves statistical analysis of grades for a specific course (average, highest, lowest, pass rate).
	 * Corresponds to: GET /grades/course/{courseId}/statistics
	 * Requires Professor/Admin/Secretary permissions.
	 * @param courseId - The UUID of the course.
	 * @returns A promise that resolves with the GradeStatistics object.
	 */
	static async getCourseGradeStatistics(courseId: string): Promise<GradeStatistics> {
		return ApiService.get<GradeStatistics>(`/grades/course/${courseId}/statistics`);
	}

	// Add methods for updating or deleting grades if those endpoints exist.
}
