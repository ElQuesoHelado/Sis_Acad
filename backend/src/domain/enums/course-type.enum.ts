/**
 * @file Defines the structural types of a course.
 */

/**
 * Enumeration representing the structure of a course.
 */
export enum CourseType {
  /** A course that only has theory sessions. */
  THEORY = "teoria",

  /** A course that only has lab sessions. */
  LAB = "labo",

  /** A course that has both theory and lab components. */
  THEORY_LAB = "teoria_labo",
}
