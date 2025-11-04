/**
 * @file Defines the interface for the Enrollment repository.
 */

import type { Enrollment } from "../entities/index.js";
import type { Id } from "../value-objects/index.js";

/**
 * Interface for the Enrollment repository.
 * Defines data access methods for the Enrollment entity.
 */
export interface IEnrollmentRepository {
  /**
   * Finds an enrollment by its unique ID.
   * @param id - The enrollment Id (Value Object).
   * @returns A promise that resolves to `Enrollment | null`.
   */
  findById(id: Id): Promise<Enrollment | null>;

  /**
   * Finds all enrollments for a specific student.
   * @param studentId - The student Id (Value Object, StudentProfile).
   * @returns A promise that resolves to an array of `Enrollment`.
   */
  findByStudent(studentId: Id): Promise<Enrollment[]>;

  /**
   * Finds multiple enrollments by their unique IDs.
   * @param ids - An array of enrollment Ids (Value Objects).
   * @returns A promise that resolves to an array of `Enrollment`.
   */
  findByIds(ids: Id[]): Promise<Enrollment[]>;

  /**
   * Finds a specific enrollment for a student in a theory group.
   * Useful to prevent duplicate enrollments.
   * @param studentId - The student Id (Value Object, StudentProfile).
   * @param theoryGroupId - The theory group Id (Value Object).
   * @returns A promise that resolves to `Enrollment | null`.
   */
  findByStudentAndTheoryGroup(
    studentId: Id,
    theoryGroupId: Id,
  ): Promise<Enrollment | null>;

  /**
   * Finds all enrollments for a specific theory group.
   * @param theoryGroupId - The theory group Id (Value Object).
   * @returns A promise that resolves to an array of `Enrollment`.
   */
  findByTheoryGroup(theoryGroupId: Id): Promise<Enrollment[]>;

  /**
   * Finds all enrollments for a specific lab group.
   * @param labGroupId - The lab group Id (Value Object).
   * @returns A promise that resolves to an array of `Enrollment`.
   */
  findByLabGroup(labGroupId: Id): Promise<Enrollment[]>;

  /**
   * Saves (creates or updates) an enrollment.
   * @param enrollment - The `Enrollment` entity to save.
   * @returns A promise that resolves when the operation completes.
   */
  save(enrollment: Enrollment): Promise<void>;

  /**
   * Deletes an enrollment by its ID.
   * @param id - The enrollment Id (Value Object) to delete.
   * @returns A promise that resolves when the operation completes.
   */
  delete(id: Id): Promise<void>;
}
