/**
 * @file Defines the interface for the ClassSchedule repository.
 */

import type { ClassSchedule } from "../entities/class-schedule.entity.js";
import type { Id, AcademicSemester } from "../value-objects/index.js";

/**
 * Interface for the ClassSchedule repository.
 * Defines data access methods for the ClassSchedule entity.
 */
export interface IClassScheduleRepository {
  /**
   * Finds a specific schedule by its unique ID.
   * @param id - The Id (VO) of the schedule.
   * @returns A promise resolving to `ClassSchedule | null`.
   */
  findById(id: Id): Promise<ClassSchedule | null>;

  /**
   * Finds all schedules for a specific theory group.
   * @param theoryGroupId - The Id (VO) of the TheoryGroup.
   * @returns A promise resolving to an array of `ClassSchedule`.
   */
  findByTheoryGroup(theoryGroupId: Id): Promise<ClassSchedule[]>;

  /**
   * Finds all schedules for a specific lab group.
   * @param labGroupId - The Id (VO) of the LabGroup.
   * @returns A promise resolving to an array of `ClassSchedule`.
   */
  findByLabGroup(labGroupId: Id): Promise<ClassSchedule[]>;

  /**
   * Finds all fixed schedules for a classroom in a specific semester.
   * Essential for the "Room Booking" module to check occupied slots.
   * @param classroomId - The Id (VO) of the classroom or lab.
   * @param semester - The AcademicSemester (VO), e.g., "2025-II".
   * @returns A promise resolving to an array of `ClassSchedule`.
   */
  findSchedulesByClassroomAndSemester(
    classroomId: Id,
    semester: AcademicSemester,
  ): Promise<ClassSchedule[]>;

  /**
   * Saves (creates or updates) a schedule.
   * @param schedule - The `ClassSchedule` entity to save.
   * @returns A promise that resolves when the operation completes.
   */
  save(schedule: ClassSchedule): Promise<void>;

  /**
   * Deletes a schedule by its ID.
   * @param id - The Id (VO) of the schedule to delete.
   * @returns A promise that resolves when the operation completes.
   */
  delete(id: Id): Promise<void>;
}
