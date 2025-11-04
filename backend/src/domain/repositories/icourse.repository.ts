/**
 * @file Defines the interface for the Course repository (catalog).
 */

import type { Course } from "../entities/index.js";
import type { Id, CourseCode } from "../value-objects/index.js";

/**
 * Interface for the Course repository.
 * Defines data access methods for the Course entity.
 */
export interface ICourseRepository {
  /**
   * Finds a course by its unique ID (UUID).
   * @param id - The course Id (Value Object).
   * @returns A promise that resolves to `Course | null`.
   */
  findById(id: Id): Promise<Course | null>;

  /**
   * Finds a course by its unique code (e.g., "11701101").
   * @param code - The CourseCode (Value Object).
   * @returns A promise that resolves to `Course | null`.
   */
  findByCode(code: CourseCode): Promise<Course | null>;

  /**
   * Retrieves all courses in the catalog.
   * @returns A promise that resolves to an array of `Course`.
   */
  findAll(): Promise<Course[]>;

  /**
   * Saves (creates or updates) a course in persistence.
   * @param course - The `Course` entity to save.
   * @returns A promise that resolves when the operation completes.
   */
  save(course: Course): Promise<void>;

  /**
   * Deletes a course by its ID.
   * @param id - The course Id (Value Object) to delete.
   * @returns A promise that resolves when the operation completes.
   */
  delete(id: Id): Promise<void>;
}
