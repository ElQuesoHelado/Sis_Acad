import { ApiService } from './api.service';
import type {
	AttendanceMarkResponse,
	MarkAttendanceRequest,
	MarkAllAbsentRequest,
	StudentAttendanceResponse,
	CourseAttendanceReportItem
} from './types';

/**
 * Service class for managing student attendance.
 */
export class AttendanceService {
	/**
	 * Marks attendance status (present, absent, late) for multiple students in a class session.
	 * Corresponds to: POST /attendance
	 * Requires Professor permissions for the associated course/lab group.
	 * @param attendanceData - Details of the class session and the attendance status for each student.
	 * @returns A promise that resolves with the AttendanceMarkResponse summarizing the operation.
	 */
	static async markAttendance(
		attendanceData: MarkAttendanceRequest
	): Promise<AttendanceMarkResponse> {
		return ApiService.post<AttendanceMarkResponse>('/attendance', attendanceData);
	}

	/**
	 * Marks all enrolled students as absent for a specific class session, typically used if the professor doesn't arrive within a timeframe.
	 * Corresponds to: POST /attendance/mark-absent
	 * May have specific permission rules (e.g., automated trigger or Secretary/Admin override).
	 * @param absentData - Details of the class session to mark all as absent.
	 * @returns A promise that resolves with a response confirming the action.
	 */
	static async markAllAbsent(absentData: MarkAllAbsentRequest): Promise<AttendanceMarkResponse> {
		// Swagger response schema is slightly different, confirm actual API response
		return ApiService.post<AttendanceMarkResponse>('/attendance/mark-absent', absentData);
	}

	/**
	 * Retrieves the complete attendance history and summary for a specific student in a specific course.
	 * Corresponds to: GET /attendance/student/{studentId}/course/{courseId}
	 * Accessible by the student, course professor, Admin, Secretary.
	 * @param studentId - The UUID of the student.
	 * @param courseId - The UUID of the course.
	 * @returns A promise that resolves with the StudentAttendanceResponse object.
	 */
	static async getStudentAttendanceForCourse(
		studentId: string,
		courseId: string
	): Promise<StudentAttendanceResponse> {
		return ApiService.get<StudentAttendanceResponse>(
			`/attendance/student/${studentId}/course/${courseId}`
		);
	}

	/**
	 * Retrieves an attendance report summarizing the status for all students in a specific course.
	 * Corresponds to: GET /attendance/course/{courseId}/report
	 * Requires Professor/Admin/Secretary permissions.
	 * @param courseId - The UUID of the course.
	 * @returns A promise that resolves with an array of CourseAttendanceReportItem objects.
	 */
	static async getCourseAttendanceReport(courseId: string): Promise<CourseAttendanceReportItem[]> {
		return ApiService.get<CourseAttendanceReportItem[]>(`/attendance/course/${courseId}/report`);
	}

	// Add methods for updating individual attendance records if that endpoint exists.
}
