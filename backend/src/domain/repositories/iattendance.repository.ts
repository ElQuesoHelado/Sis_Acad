/**
 * @file Defines the interface for the Attendance entity repository.
 */

import type { Attendance } from "../entities/attendance.entity.js";
import type { Id } from "../value-objects/index.js";
import type { ClassType } from "../enums/index.js";

export interface IAttendanceRepository {
  /**
   * Finds an attendance record by its ID.
   * @param id - The Id (VO) of the record.
   * @returns A promise resolving to `Attendance | null`.
   */
  findById(id: Id): Promise<Attendance | null>;

  /**
   * Finds all attendance records for a given enrollment (student in course).
   * Useful for "View Attendance" feature.
   * @param enrollmentId - The Id (VO) of the enrollment.
   * @returns A promise resolving to an array of `Attendance`.
   */
  findByEnrollmentId(enrollmentId: Id): Promise<Attendance[]>;

  /**
   * Finds a specific attendance record for an enrollment on a given date
   * and class type.
   * Useful to determine whether to "create" or "update" a record.
   * @param enrollmentId - The Id (VO) of the enrollment.
   * @param date - The date (normalized to 00:00:00).
   * @param classType - The class type (THEORY or LAB).
   * @returns A promise resolving to `Attendance | null`.
   */
  findByEnrollmentDateAndType(
    enrollmentId: Id,
    date: Date,
    classType: ClassType,
  ): Promise<Attendance | null>;

  /**
   * Finds all attendance records for a list of enrollments on a specific
   * date and class type.
   * Useful for "Take Attendance" feature for teachers.
   * @param enrollmentIds - Array of enrollment IDs (VOs).
   * @param date - The date (normalized to 00:00:00).
   * @param classType - The class type (THEORY or LAB).
   * @returns A promise resolving to an array of `Attendance`.
   */
  findManyByEnrollmentsDateAndType(
    enrollmentIds: Id[],
    date: Date,
    classType: ClassType,
  ): Promise<Attendance[]>;

  /**
   * Saves (creates or updates) a single attendance record.
   * @param attendance - The `Attendance` entity to save.
   * @returns A promise resolving when the operation is complete.
   */
  save(attendance: Attendance): Promise<void>;

  /**
   * Saves (creates or updates) multiple attendance records in bulk.
   * Useful for "Save Attendance" feature for teachers.
   * @param attendances - An array of `Attendance` entities.
   * @returns A promise resolving when the operation is complete.
   */
  saveMany(attendances: Attendance[]): Promise<void>;
}
