/**
 * @file Defines the interface for the StudentProfile repository.
 */

import type { StudentProfile } from "../entities/profiles/student.profile.js";
import type { Id } from "../value-objects/index.js";

/**
 * Interface for the StudentProfile repository.
 * Defines the data access methods for the StudentProfile entity.
 */
export interface IStudentProfileRepository {
  /**
   * Finds a student profile by its unique ID.
   * @param id - The `Id` Value Object of the student profile.
   * @returns A promise that resolves to `StudentProfile | null`.
   */
  findById(id: Id): Promise<StudentProfile | null>;

  /**
   * Finds multiple student profiles by their unique IDs.
   * @param ids - An array of profile Ids (Value Objects).
   * @returns A promise that resolves to an array of `StudentProfile`.
   */
  findByIds(ids: Id[]): Promise<StudentProfile[]>;

  /**
   * Finds a student profile by the user's ID.
   * @param userId - The `Id` Value Object of the user.
   * @returns A promise that resolves to `StudentProfile | null`.
   */
  findByUserId(userId: Id): Promise<StudentProfile | null>;

  /**
   * Saves (creates or updates) a student profile in persistence.
   * @param profile - The `StudentProfile` entity to save.
   * @returns A promise that resolves when the operation is complete.
   */
  save(profile: StudentProfile): Promise<void>;

  /**
   * Deletes a student profile by its ID.
   * @param id - The `Id` Value Object of the profile to delete.
   * @returns A promise that resolves when the operation is complete.
   */
  delete(id: Id): Promise<void>;
}
