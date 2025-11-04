/**
 * @file DTOs related to student information.
 */

import type { GradeType } from "@/domain/enums/grade-type.enum.js";

/**
 * Represents a student in a teacher's roster.
 * This DTO is secure and only exposes data needed by the teacher.
 */
export interface StudentRosterDto {
  /**
   * The ID of the enrollment.
   * This is the key the UI must send back when taking attendance.
   */
  enrollmentId: string;

  /** The student's CUI (e.g., "20233585") */
  studentCode: string;

  /** Student's first name */
  name: string;

  /** Student's last name */
  surname: string;

  /** Student's email */
  email: string;
}

/**
 * Represents a single grade cell in the roster grid.
 */
export interface StudentGradeEntry {
  type: GradeType;
  score: number | null;
}

/**
 * Represents a student in a teacher's roster, including all their grades.
 * This DTO powers the main grade-entry grid.
 */
export interface StudentRosterWithGradesDto {
  enrollmentId: string;
  studentCode: string;
  name: string;
  surname: string;
  email: string;
  /**
   * An array (6 items) representing the student's
   * grade status for each evaluation type.
   */
  grades: StudentGradeEntry[];
}
