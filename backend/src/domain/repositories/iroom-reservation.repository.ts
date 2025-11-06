/**
 * @file Defines the repository interface for the RoomReservation entity.
 */

import type { RoomReservation } from "../entities/room-reservation.entity.js";
import type {
  Id,
  AcademicSemester,
  TimeOfDay, // <-- Added
} from "../value-objects/index.js";

/**
 * Repository interface for managing RoomReservation entities.
 */
export interface IRoomReservationRepository {
  /**
   * Finds a reservation by its ID.
   * @param id - The reservation Id (VO).
   * @returns A promise that resolves to `RoomReservation | null`.
   */
  findById(id: Id): Promise<RoomReservation | null>;

  /**
   * Finds all reservations made by a professor in a specific semester.
   * (Used for the "My Reservations" view).
   * @param professorId - The professor Id (VO).
   * @param semester - The academic semester (VO).
   * @returns A promise that resolves to an array of `RoomReservation`.
   */
  findByProfessorAndSemester(
    professorId: Id,
    semester: AcademicSemester,
  ): Promise<RoomReservation[]>;

  /**
   * Finds all one-time reservations for a classroom in a specific semester.
   * (Used for "Classroom Schedule" view and conflict detection).
   * @param classroomId - The classroom Id (VO).
   * @param semester - The academic semester (VO).
   * @returns A promise that resolves to an array of `RoomReservation`.
   */
  findByClassroomAndSemester(
    classroomId: Id,
    semester: AcademicSemester,
  ): Promise<RoomReservation[]>;

  /**
   * Finds active reservations that overlap with a specific date and time block
   * for a given classroom and semester.
   * (Key method for the "Create Reservation" use case).
   *
   * @param classroomId - The classroom Id (VO).
   * @param semester - The academic semester (VO).
   * @param date - The specific date (VO) to check for conflicts.
   * @param startTime - The start time (VO) to check.
   * @param endTime - The end time (VO) to check.
   * @returns A promise that resolves to an array of conflicting `RoomReservation`s.
   */
  findOverlappingReservations(
    classroomId: Id,
    semester: AcademicSemester,
    date: Date,
    startTime: TimeOfDay,
    endTime: TimeOfDay,
  ): Promise<RoomReservation[]>;

  /**
   * Counts active (RESERVED) reservations for a professor within a date range.
   * Used to enforce business rules (e.g., weekly limit).
   * @param professorId - The professor Id (VO).
   * @param startDate - The start of the date range (inclusive).
   * @param endDate - The end of the date range (inclusive).
   * @returns A promise resolving to the number of reservations.
   */
  countByProfessorAndDateRange(
    professorId: Id,
    startDate: Date,
    endDate: Date,
  ): Promise<number>;

  /**
   * Saves (creates or updates) a reservation.
   * @param reservation - The `RoomReservation` entity to save.
   * @returns A promise that resolves when the operation is complete.
   */
  save(reservation: RoomReservation): Promise<void>;

  /**
   * Deletes a reservation by its ID.
   * @param id - The reservation Id (VO) to delete.
   * @returns A promise that resolves when the operation completes.
   */
  delete(id: Id): Promise<void>;
}
