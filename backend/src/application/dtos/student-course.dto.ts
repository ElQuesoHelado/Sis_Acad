/**
 * @file DTO for the student's enrolled courses list.
 */

/**
 * Represents the lab enrollment status for a course.
 */
export type LabEnrollmentStatus = "Matriculado" | "Sin Matricula" | "N/A";

/**
 * DTO representing a single course a student is enrolled in.
 */
export interface StudentCourseDto {
  /** The enrollment ID (primary key for this context) */
  enrollmentId: string;

  /** The official course code (e.g., "01703239") */
  courseCode: string;

  /** The name of the course (e.g., "SISTEMAS OPERATIVOS") */
  courseName: string;

  /** Number of credits for the course */
  credits: number;

  /** Full name of the theory professor */
  professorName: string;

  /**
   * Indicates the student's lab enrollment status.
   * "Enrolled": Already in a lab group.
   * "Not Enrolled": Needs to enroll (if course type is teoria_labo).
   * "N/A": Course does not have a lab (e.g., type 'teoria').
   */
  labStatus: LabEnrollmentStatus;
}
