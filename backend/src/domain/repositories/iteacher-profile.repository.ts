/**
 * @file Defines the interface for the TeacherProfile repository.
 */

import type { TeacherProfile } from "../entities/profiles/teacher.profile.js";
import type { Id } from "../value-objects/index.js";

/**
 * Interface for the TeacherProfile repository.
 * Defines the data access methods for the TeacherProfile entity.
 */
export interface ITeacherProfileRepository {
  /**
   * Finds a teacher profile by its unique ID (primary key).
   * @param id - The Id (VO) of the teacher profile.
   * @returns A promise resolving to `TeacherProfile | null`.
   */
  findById(id: Id): Promise<TeacherProfile | null>;

  /**
   * Finds a teacher profile by the associated user's ID (foreign key).
   * This is the most common method to get the profile of a logged-in user.
   * @param userId - The Id (VO) of the user.
   * @returns A promise resolving to `TeacherProfile | null`.
   */
  findByUserId(userId: Id): Promise<TeacherProfile | null>;

  /**
   * Saves (creates or updates) a teacher profile in persistence.
   * @param profile - The `TeacherProfile` entity to save.
   * @returns A promise resolving when the operation completes.
   */
  save(profile: TeacherProfile): Promise<void>;

  /**
   * Deletes a teacher profile by its ID.
   * @param id - The Id (VO) of the profile to delete.
   * @returns A promise resolving when the operation completes.
   */
  delete(id: Id): Promise<void>;
}
