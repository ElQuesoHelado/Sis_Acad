import { type GradeOutputDto } from "./grade.dto.js";

/**
 * Defines the status of the course based on the average grade.
 */
export type CourseStatus = "Aprobado" | "Desaprobado" | "En Progreso";

/**
 * DTO representing a student's grade summary for a specific course.
 */
export interface StudentCourseGradesDto {
  /** Enrollment ID (for navigation or future actions) */
  enrollmentId: string;

  /** Name of the course */
  courseName: string;

  /** Full name of the professor */
  professorName: string;

  /** Detailed list of grades (e.g., Partial 1, Continuous 1) */
  grades: GradeOutputDto[];

  /** Calculated final average. Null if no grades are present. */
  average: number | null;

  /** Status of the course (Passed, Failed, In Progress) */
  status: CourseStatus;
}
