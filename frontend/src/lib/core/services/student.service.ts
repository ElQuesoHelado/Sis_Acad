import { ApiService } from './api.service';
import type {
	UserResponse,
	CreateUserRequest,
	UpdateUserStatusRequest,
	DeleteUserResponse,
	UpdateUserStatusResponse
} from './types';

/**
 * Service class for managing student-related API calls.
 * Requires appropriate permissions (Admin/Secretary roles typically).
 */
export class StudentService {
	/**
	 * Creates a new student account.
	 * Corresponds to: POST /students
	 * @param studentData - The details of the student to create.
	 * @returns A promise that resolves with the created UserResponse object.
	 */
	static async createStudent(studentData: CreateUserRequest): Promise<UserResponse> {
		if (!studentData.password) {
			throw new Error('Password is required to create a student.');
		}
		return ApiService.post<UserResponse>('/students', studentData);
	}

	/**
	 * Retrieves a list of all students.
	 * Corresponds to: GET /students
	 * @returns A promise that resolves with an array of UserResponse objects.
	 */
	static async getAllStudents(): Promise<UserResponse[]> {
		return ApiService.get<UserResponse[]>('/students');
	}

	/**
	 * Retrieves a single student by their unique ID.
	 * Corresponds to: GET /students/{studentId}
	 * @param studentId - The UUID of the student.
	 * @returns A promise that resolves with the UserResponse object.
	 */
	static async getStudentById(studentId: string): Promise<UserResponse> {
		return ApiService.get<UserResponse>(`/students/${studentId}`);
	}

	/**
	 * Updates the status (active/inactive) of a student.
	 * Corresponds to: PATCH /students/{studentId}/status
	 * @param studentId - The UUID of the student.
	 * @param statusUpdate - An object containing the new status boolean.
	 * @returns A promise that resolves with the update status response.
	 */
	static async updateStudentStatus(
		studentId: string,
		statusUpdate: UpdateUserStatusRequest
	): Promise<UpdateUserStatusResponse> {
		return ApiService.patch<UpdateUserStatusResponse>(
			`/students/${studentId}/status`,
			statusUpdate
		);
	}

	/**
	 * Permanently deletes a student account. Use with caution.
	 * Corresponds to: DELETE /students/{studentId}
	 * @param studentId - The UUID of the student to delete.
	 * @returns A promise that resolves with the delete confirmation response.
	 */
	static async deleteStudent(studentId: string): Promise<DeleteUserResponse> {
		return ApiService.delete<DeleteUserResponse>(`/students/${studentId}`);
	}
}
