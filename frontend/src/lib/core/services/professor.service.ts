import { ApiService } from './api.service';
import type {
	UserResponse,
	CreateUserRequest,
	UpdateUserStatusRequest,
	DeleteUserResponse,
	UpdateUserStatusResponse
} from './types';

/**
 * Service class for managing professor-related API calls.
 * Requires appropriate permissions (Admin/Secretary roles typically).
 */
export class ProfessorService {
	/**
	 * Creates a new professor account.
	 * Corresponds to: POST /professors
	 * @param professorData - The details of the professor to create.
	 * @returns A promise that resolves with the created UserResponse object.
	 */
	static async createProfessor(professorData: CreateUserRequest): Promise<UserResponse> {
		if (!professorData.password) {
			throw new Error('Password is required to create a professor.');
		}
		return ApiService.post<UserResponse>('/professors', professorData);
	}

	/**
	 * Retrieves a list of all professors.
	 * Corresponds to: GET /professors
	 * @returns A promise that resolves with an array of UserResponse objects.
	 */
	static async getAllProfessors(): Promise<UserResponse[]> {
		return ApiService.get<UserResponse[]>('/professors');
	}

	/**
	 * Retrieves a single professor by their unique ID.
	 * Corresponds to: GET /professors/{professorId}
	 * @param professorId - The UUID of the professor.
	 * @returns A promise that resolves with the UserResponse object.
	 */
	static async getProfessorById(professorId: string): Promise<UserResponse> {
		return ApiService.get<UserResponse>(`/professors/${professorId}`);
	}

	/**
	 * Updates the status (active/inactive) of a professor.
	 * Corresponds to: PATCH /professors/{professorId}/status
	 * @param professorId - The UUID of the professor.
	 * @param statusUpdate - An object containing the new status boolean.
	 * @returns A promise that resolves with the update status response.
	 */
	static async updateProfessorStatus(
		professorId: string,
		statusUpdate: UpdateUserStatusRequest
	): Promise<UpdateUserStatusResponse> {
		return ApiService.patch<UpdateUserStatusResponse>(
			`/professors/${professorId}/status`,
			statusUpdate
		);
	}

	/**
	 * Permanently deletes a professor account. Use with caution.
	 * Corresponds to: DELETE /professors/{professorId}
	 * @param professorId - The UUID of the professor to delete.
	 * @returns A promise that resolves with the delete confirmation response.
	 */
	static async deleteProfessor(professorId: string): Promise<DeleteUserResponse> {
		return ApiService.delete<DeleteUserResponse>(`/professors/${professorId}`);
	}
}
