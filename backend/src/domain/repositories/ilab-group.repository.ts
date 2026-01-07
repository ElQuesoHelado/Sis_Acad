/**
 * @file Defines the interface for the LabGroup repository.
 */

import type { LabGroup } from "../entities/index.js";
import type { Id } from "../value-objects/index.js";

/**
 * Interface for the LabGroup repository.
 * Defines data access methods for the LabGroup entity.
 */
export interface ILabGroupRepository {
  /**
   * Finds a lab group by its unique ID.
   * @param id - The lab group Id (Value Object).
   * @returns A promise that resolves to `LabGroup | null`.
   */
  findById(id: Id): Promise<LabGroup | null>;

  /**
   * Finds all lab groups associated with a specific course.
   * @param courseId - The course Id (Value Object).
   * @returns A promise that resolves to an array of `LabGroup`.
   */
  findByCourse(courseId: Id): Promise<LabGroup[]>;

  /**
   * Finds all lab groups taught by a specific professor.
   * @param professorId - The professor Id (Value Object).
   * @returns A promise resolving to an array of `LabGroup`.
   */
  findByProfessor(professorId: Id): Promise<LabGroup[]>;

  /**
   * Saves (creates or updates) a lab group in persistence.
   * @param labGroup - The `LabGroup` entity to save.
   * @returns A promise that resolves when the operation completes.
   */
  save(labGroup: LabGroup): Promise<void>;

  /**
   * Deletes a lab group by its ID.
   * @param id - The lab group Id (Value Object) to delete.
   * @returns A promise that resolves when the operation completes.
   */
  delete(id: Id): Promise<void>;
  findAll(): Promise<LabGroup[]>;
}
