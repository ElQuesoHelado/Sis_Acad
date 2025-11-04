import { type GradeType, type ClassType } from "@/domain/enums/index.js";

/**
 * DTO for a single grade.
 * Represents a grade to be returned to the client or user interface.
 */
export interface GradeOutputDto {
  /** Unique identifier of the grade */
  id: string;

  /** Type of the grade (e.g., EXAM, ASSIGNMENT) */
  type: GradeType;

  /** Human-readable name of the grade type */
  typeName: string;

  /** Score value of the grade, typically between 0 and 20 */
  score: number;
}

/**
 * Represents a single grade entry to be saved in a bulk request.
 * Each entry corresponds to ONE "cell" edited by the professor.
 */
export interface BulkGradeSaveEntryDto {
  /** Enrollment ID to which the grade belongs */
  enrollmentId: string;

  /** Column/type of grade being updated (e.g., parcial_1, parcial_2, practica) */
  type: GradeType;

  /** Numeric score the teacher wants to save */
  score: number;
}

/**
 * Input DTO for the SaveBulkGrades use case.
 * The UI sends *only* the cells that the professor edited.
 */
export interface SaveBulkGradesDto {
  /** User ID of the professor performing the operation */
  teacherUserId: string;

  /** Type of class (THEORY or LAB) */
  classType: ClassType;

  /** The theory or lab group where these grades belong */
  groupId: string;

  /** List of grade cells the teacher edited */
  entries: BulkGradeSaveEntryDto[];
}
