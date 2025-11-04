/**
 * @file Defines the access control roles for users within the system.
 */
export enum UserRole {
  /** Full system access, can manage users and settings. */
  ADMIN = "administrador",

  /** Can manage enrollments, courses, and other academic logistics. */
  SECRETARY = "secretaria",

  /** Can manage grades, attendance, and course content. */
  PROFESSOR = "profesor",

  /** Can view grades, attendance, and course content. */
  STUDENT = "estudiante",
}
