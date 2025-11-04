/**
 * @file Defines the official evaluation types based on UNSA's grading system.
 *
 * The system uses 3 partial exams and 3 continuous evaluations.
 */
export enum GradeType {
  /** First partial exam. */
  PARTIAL_1 = "parcial_1",

  /** Second partial exam. */
  PARTIAL_2 = "parcial_2",

  /** Third partial exam. */
  PARTIAL_3 = "parcial_3",

  /** First continuous evaluation. */
  CONTINUOUS_1 = "continua_1",

  /** Second continuous evaluation. */
  CONTINUOUS_2 = "continua_2",

  /** Third continuous evaluation. */
  CONTINUOUS_3 = "continua_3",
}
