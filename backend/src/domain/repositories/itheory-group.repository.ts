/**
 * @file Defines the interface for the TheoryGroup repository.
 */

import type { TheoryGroup } from "../entities/theory-group.entity.js";
import type { Id, AcademicSemester } from "../value-objects/index.js";

/**
 * Interface for the TheoryGroup repository (Course Offering).
 * Defines data access methods for the TheoryGroup entity.
 */
export interface ITheoryGroupRepository {
  /**
   * Finds a theory group by its unique ID.
   * @param id - The Id (VO) of the theory group.
   * @returns A promise resolving to `TheoryGroup | null`.
   */
  findById(id: Id): Promise<TheoryGroup | null>;

  /**
   * Finds all theory groups offered for a specific course in a semester.
   * E.g., returns "Group A", "Group B", "Group C" of Calculus I in 2024-I.
   * @param courseId - The Id (VO) of the course (catalog).
   * @param semester - The AcademicSemester (VO), e.g., "2024-I".
   * @returns A promise resolving to an array of `TheoryGroup`.
   */
  findByCourseAndSemester(
    courseId: Id,
    semester: AcademicSemester,
  ): Promise<TheoryGroup[]>;

  /**
   * Finds all theory groups taught by a professor in a semester.
   * Useful for the "Professor Schedule" module.
   * @param professorId - The Id (VO) of the professor (User).
   * @param semester - The AcademicSemester (VO), e.g., "2024-I".
   * @returns A promise resolving to an array of `TheoryGroup`.
   */
  findByProfessorAndSemester(
    professorId: Id,
    semester: AcademicSemester,
  ): Promise<TheoryGroup[]>;

  /**
   * Saves (creates or updates) a theory group.
   * @param theoryGroup - The `TheoryGroup` entity to save.
   * @returns A promise that resolves when the operation completes.
   */
  save(theoryGroup: TheoryGroup): Promise<void>;

  /**
   * Deletes a theory group by its ID.
   * @param id - The Id (VO) of the theory group to delete.
   * @returns A promise that resolves when the operation completes.
   */
  delete(id: Id): Promise<void>;
}
