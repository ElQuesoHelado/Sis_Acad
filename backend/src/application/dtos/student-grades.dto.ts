import type { GradeType } from "@/domain/enums/grade-type.enum.js";
import { type GradeOutputDto } from "./grade.dto.js";

/**
 * Defines the status of the course based on the average grade.
 */
export type CourseStatus = "Aprobado" | "Desaprobado" | "En Progreso";

/**
 * Represents statistical information for a specific grade type within a group.
 */
export interface GroupGradeStatsDto {
  /** The type of grade (e.g., parcial_1, continua_1). */
  type: GradeType;

  /** The average grade obtained by the group for this evaluation type. */
  average: number;

  /** The highest grade obtained by the group for this evaluation type. */
  max: number;

  /** The lowest grade obtained by the group for this evaluation type. */
  min: number;
}

/**
 * Represents the weight assigned to a specific grade type.
 */
export interface GradeWeightDto {
  /** The type of grade (e.g., parcial_1, continua_1). */
  type: GradeType;

  /** The percentage weight applied to this grade type (e.g., 20). */
  weight: number;
}


/**
 * DTO representing a student's grade summary for a specific course.
 */
export interface StudentCourseGradesDto {
  /** The unique identifier of the student's enrollment. */
  enrollmentId: string;

  /** The name of the course. */
  courseName: string;

  /** The name of the professor teaching the course. */
  professorName: string;

  /** The list of individual grade records. */
  grades: GradeOutputDto[];

  /** The computed average grade for the course, or null if unavailable. */
  average: number | null;

  /** The student's status in the course. */
  status: CourseStatus;

  /** Statistical data comparing the student's grades with the group. */
  groupStats: GroupGradeStatsDto[];

  /** The weighting applied to each grade type for final calculations. */
  weights: GradeWeightDto[];
}
