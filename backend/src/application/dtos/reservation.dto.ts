/**
 * @file DTOs for room reservation operations.
 */

/**
 * Input DTO for the CreateRoomReservation use case.
 * This is the data structure the API client
 */
export interface CreateReservationDto {
  /**
   * The UUID of the classroom to be reserved.
   */
  classroomId: string;

  /**
   * The academic semester (e.g., "2024-I").
   */
  semester: string;

  /**
   * The specific date of the reservation (ISO 8601 format: "YYYY-MM-DD").
   */
  date: string;

  /**
   * The start time (24-hour format: "HH:MM").
   */
  startTime: string;

  /**
   * The end time (24-hour format: "HH:MM").
   */
  endTime: string;

  /**
   * Optional notes or reason for the reservation.
   */
  notes?: string;
}
