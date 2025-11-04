/**
 * @file Defines the interface for the Classroom repository.
 */

import type { Classroom } from "../entities/index.js";
import type { ClassType } from "../enums/index.js";
import type { Id } from "../value-objects/index.js";

/**
 * Interface for the Classroom repository.
 * Defines the data access methods for the Classroom entity.
 */
export interface IClassroomRepository {
  /**
   * Finds a classroom by its unique ID.
   * @param id - The `Id` Value Object of the classroom.
   * @returns A promise that resolves to `Classroom | null`.
   */
  findById(id: Id): Promise<Classroom | null>;

  /**
   * Finds all classrooms of a specific type (e.g., all 'LAB').
   * @param type - The `ClassType` (THEORY or LAB).
   * @returns A promise that resolves to an array of `Classroom`.
   */
  findByType(type: ClassType): Promise<Classroom[]>;

  /**
   * Retrieves all classrooms.
   * @returns A promise that resolves to an array of all `Classroom` entities.
   */
  findAll(): Promise<Classroom[]>;

  /**
   * Saves (creates or updates) a classroom.
   * @param classroom - The `Classroom` entity to save.
   * @returns A promise that resolves when the operation is complete.
   */
  save(classroom: Classroom): Promise<void>;

  /**
   * Deletes a classroom by its ID.
   * @param id - The `Id` Value Object of the classroom to delete.
   * @returns A promise that resolves when the operation is complete.
   */
  delete(id: Id): Promise<void>;
}
