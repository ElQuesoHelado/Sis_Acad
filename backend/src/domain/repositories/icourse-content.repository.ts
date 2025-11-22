/**
 * @file Defines the interface for the CourseContent repository.
 */

import type { CourseContent } from "../entities/course-content.entity.js";
import type { Id } from "../value-objects/index.js";

/**
 * Repository interface for accessing CourseContent entities.
 */
export interface ICourseContentRepository {
  /**
   * Finds a specific topic by its ID.
   * @param id - The topic's Id (Value Object).
   * @returns A promise that resolves to `CourseContent | null`.
   */
  findById(id: Id): Promise<CourseContent | null>;

  /**
   * Finds all syllabus topics for a specific TheoryGroup,
   * usually ordered by week.
   * @param theoryGroupId - The Id (VO) of the TheoryGroup.
   * @returns A promise that resolves to an array of `CourseContent`.
   */
  findByTheoryGroupId(theoryGroupId: Id): Promise<CourseContent[]>;

  /**
   * Saves (creates or updates) a syllabus topic.
   * @param topic - The `CourseContent` entity to save.
   * @returns A promise that resolves when the operation completes.
   */
  save(topic: CourseContent): Promise<void>;

  /**
   * Saves multiple topics at once (e.g., when uploading a syllabus).
   * @param topics - An array of `CourseContent` entities.
   * @returns A promise that resolves when the operation completes.
   */
  saveMany(topics: CourseContent[]): Promise<void>;

  /**
   * Deletes a topic by its ID.
   * @param id - The Id (VO) of the topic to delete.
   * @returns A promise that resolves when the operation completes.
   */
  delete(id: Id): Promise<void>;

  /**
 * Fetches the syllabus topics using the enrollment ID.
 * Performs an inner JOIN to validate that the enrollment belongs to the student
 * and corresponds to the correct theory group.
 *
 * @param enrollmentId - The enrollment ID.
 * @param studentId - The student profile ID (for security).
 */
  findByEnrollmentId(enrollmentId: Id, studentId: Id): Promise<CourseContent[]>;
}
