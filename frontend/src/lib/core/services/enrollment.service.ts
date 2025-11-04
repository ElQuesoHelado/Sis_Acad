import { ApiService } from './api.service';
import type {
	EnrollmentResponse,
	CreateEnrollmentRequest,
	BulkEnrollmentRequest,
	BulkEnrollmentResponse
} from './types';

/**
 * Service class for managing student enrollments in courses.
 */
export class EnrollmentService {
	/**
	 * Enrolls a single student into a course (and optionally a lab group).
	 * Corresponds to: POST /enrollments
	 * Requires Secretary permissions.
	 * @param enrollmentData - Details of the student, course, and optional lab group.
	 * @returns A promise that resolves with the created EnrollmentResponse object.
	 */
	static async createEnrollment(
		enrollmentData: CreateEnrollmentRequest
	): Promise<EnrollmentResponse> {
		return ApiService.post<EnrollmentResponse>('/enrollments', enrollmentData);
	}

	/**
	 * Enrolls multiple students into a course, with optional automatic lab assignment.
	 * Corresponds to: POST /enrollments/bulk
	 * Requires Secretary permissions.
	 * @param bulkData - Details including courseId, list of studentIds, and auto-assignment flag.
	 * @returns A promise that resolves with the BulkEnrollmentResponse summarizing the operation.
	 */
	static async bulkEnrollStudents(
		bulkData: BulkEnrollmentRequest
	): Promise<BulkEnrollmentResponse> {
		return ApiService.post<BulkEnrollmentResponse>('/enrollments/bulk', bulkData);
	}

	/**
	 * Retrieves all enrollments for a specific student.
	 * Corresponds to: GET /enrollments/student/{studentId}
	 * @param studentId - The UUID of the student.
	 * @returns A promise that resolves with an array of EnrollmentResponse objects.
	 */
	static async getEnrollmentsByStudent(studentId: string): Promise<EnrollmentResponse[]> {
		return ApiService.get<EnrollmentResponse[]>(`/enrollments/student/${studentId}`);
	}

	/**
	 * Retrieves all enrollments for a specific course.
	 * Corresponds to: GET /enrollments/course/{courseId}
	 * @param courseId - The UUID of the course.
	 * @returns A promise that resolves with an array of EnrollmentResponse objects.
	 */
	static async getEnrollmentsByCourse(courseId: string): Promise<EnrollmentResponse[]> {
		return ApiService.get<EnrollmentResponse[]>(`/enrollments/course/${courseId}`);
	}

	// Add methods for updating enrollment status (e.g., dropping a course) or deleting enrollments if those endpoints exist.
}
