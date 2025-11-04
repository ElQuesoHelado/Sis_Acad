import { ApiService } from './api.service';
import type {
	LabGroupResponse,
	CreateLabGroupRequest,
	LabReservationResponse,
	CreateLabReservationRequest
} from './types';

/**
 * Service class for managing lab groups and lab reservations.
 */
export class LabService {
	// --- Lab Groups ---

	/**
	 * Creates a new lab group for a specific course.
	 * Corresponds to: POST /labs/groups
	 * Requires Secretary permissions.
	 * @param groupData - Details of the lab group to create.
	 * @returns A promise that resolves with the created LabGroupResponse object.
	 */
	static async createLabGroup(groupData: CreateLabGroupRequest): Promise<LabGroupResponse> {
		return ApiService.post<LabGroupResponse>('/labs/groups', groupData);
	}

	/**
	 * Retrieves all lab groups associated with a specific course.
	 * Corresponds to: GET /labs/groups/course/{courseId}
	 * @param courseId - The UUID of the course.
	 * @returns A promise that resolves with an array of LabGroupResponse objects.
	 */
	static async getLabGroupsByCourse(courseId: string): Promise<LabGroupResponse[]> {
		return ApiService.get<LabGroupResponse[]>(`/labs/groups/course/${courseId}`);
	}

	/**
	 * Retrieves all lab groups assigned to the currently logged-in professor.
	 * Corresponds to: GET /labs/groups/my-groups
	 * Requires Professor permissions.
	 * @returns A promise that resolves with an array of LabGroupResponse objects.
	 */
	static async getMyLabGroups(): Promise<LabGroupResponse[]> {
		return ApiService.get<LabGroupResponse[]>('/labs/groups/my-groups');
	}

	// Add methods for updating or deleting lab groups if endpoints exist.

	// --- Lab Reservations ---

	/**
	 * Creates a request for a lab reservation by a professor.
	 * Corresponds to: POST /labs/reservations
	 * Requires Professor permissions. Subject to rules (e.g., max per week).
	 * @param reservationData - Details of the requested reservation.
	 * @returns A promise that resolves with the created (pending) LabReservationResponse object.
	 */
	static async createLabReservation(
		reservationData: CreateLabReservationRequest
	): Promise<LabReservationResponse> {
		return ApiService.post<LabReservationResponse>('/labs/reservations', reservationData);
	}

	/**
	 * Retrieves all lab reservations across the system.
	 * Corresponds to: GET /labs/reservations
	 * Requires Admin/Secretary permissions.
	 * @returns A promise that resolves with an array of all LabReservationResponse objects.
	 */
	static async getAllLabReservations(): Promise<LabReservationResponse[]> {
		return ApiService.get<LabReservationResponse[]>('/labs/reservations');
	}

	/**
	 * Retrieves all lab reservations made by the currently logged-in professor.
	 * Corresponds to: GET /labs/reservations/my-reservations
	 * Requires Professor permissions.
	 * @returns A promise that resolves with an array of LabReservationResponse objects.
	 */
	static async getMyLabReservations(): Promise<LabReservationResponse[]> {
		return ApiService.get<LabReservationResponse[]>('/labs/reservations/my-reservations');
	}

	/**
	 * Approves a pending lab reservation.
	 * Corresponds to: PUT /labs/reservations/{reservationId}/approve
	 * Requires Secretary permissions.
	 * @param reservationId - The UUID of the reservation to approve.
	 * @returns A promise that resolves with the updated LabReservationResponse object (status: 'approved').
	 */
	static async approveLabReservation(reservationId: string): Promise<LabReservationResponse> {
		return ApiService.put<LabReservationResponse>(
			`/labs/reservations/${reservationId}/approve`,
			{}
		);
	}

	/**
	 * Rejects a pending lab reservation.
	 * Corresponds to: PUT /labs/reservations/{reservationId}/reject
	 * Requires Secretary permissions.
	 * @param reservationId - The UUID of the reservation to reject.
	 * @returns A promise that resolves with the updated LabReservationResponse object (status: 'rejected').
	 */
	static async rejectLabReservation(reservationId: string): Promise<LabReservationResponse> {
		return ApiService.put<LabReservationResponse>(`/labs/reservations/${reservationId}/reject`, {});
	}

	/**
	 * Cancels a lab reservation (typically one made by the professor themselves).
	 * Corresponds to: PUT /labs/reservations/{reservationId}/cancel
	 * Requires Professor permissions (and ownership of the reservation).
	 * @param reservationId - The UUID of the reservation to cancel.
	 * @returns A promise that resolves with the updated LabReservationResponse object (status: 'cancelled').
	 */
	static async cancelLabReservation(reservationId: string): Promise<LabReservationResponse> {
		return ApiService.put<LabReservationResponse>(`/labs/reservations/${reservationId}/cancel`, {});
	}
}
