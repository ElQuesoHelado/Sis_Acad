/**
 * @file Defines the repository interface for the Grade entity.
 */

import type { Grade } from "../entities/grade.entity.js";
import type { Id } from "../value-objects/index.js";
import type { GradeType } from "../enums/index.js";


/**
 * Internal structure returned by the repository for aggregated grade statistics.
 */
export interface GroupGradeStats {
  /** The identifier of the theory group. */
  theoryGroupId: string;

  /** The type of grade being evaluated. */
  type: GradeType;

  /** The average grade within the group for this grade type. */
  average: number;

  /** The highest grade within the group for this grade type. */
  max: number;

  /** The lowest grade within the group for this grade type. */
  min: number;
}


/**
 * Repository interface for managing Grade entities.
 * Defines the data access methods for student grades.
 */
export interface IGradeRepository {
  /**
   * Finds a specific grade by its ID.
   * @param id - The Grade Id (VO).
   * @returns A promise that resolves to `Grade | null`.
   */
  findById(id: Id): Promise<Grade | null>;

  /**
   * Finds all grades associated with a specific enrollment.
   * (Used for "View Grades" for a student).
   * @param enrollmentId - The Enrollment Id (VO).
   * @returns A promise that resolves to an array of `Grade`.
   */
  findByEnrollmentId(enrollmentId: Id): Promise<Grade[]>;

  /**
   * Finds a specific grade type (e.g., Partial 1) for a specific enrollment.
   * (Useful to determine whether to "create" or "update" a grade).
   * @param enrollmentId - The Enrollment Id (VO).
   * @param type - The grade type (e.g., GradeType.PARTIAL_1).
   * @returns A promise that resolves to `Grade | null`.
   */
  findByEnrollmentAndType(
    enrollmentId: Id,
    type: GradeType,
  ): Promise<Grade | null>;

  /**
   * Saves (creates or updates) a grade.
   * @param grade - The `Grade` entity to save.
   * @returns A promise that resolves when the operation completes.
   */
  save(grade: Grade): Promise<void>;

  /**
   * Saves (creates or updates) multiple grades in bulk.
   * @param grades - An array of `Grade` entities.
   * @returns A promise that resolves when the operation completes.
   */
  saveMany(grades: Grade[]): Promise<void>;

  /**
   * Deletes a grade by its ID.
   * @param id - The Grade Id (VO) to delete.
   * @returns A promise that resolves when the operation completes.
   */
  delete(id: Id): Promise<void>;

  /**
   * Retrieves aggregated statistics (average, max, min) by grade type
   * for the specified theory groups.
   * Designed for dashboards and reporting.
   *
   * @param theoryGroupIds - A list of theory group identifiers to analyze.
   * @returns A collection of aggregated grade statistics.
   */
  findStatsByTheoryGroupIds(theoryGroupIds: Id[]): Promise<GroupGradeStats[]>;
}
