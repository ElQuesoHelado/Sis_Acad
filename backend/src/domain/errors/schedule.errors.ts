/**
 * @file Defines domain-specific errors for the ClassSchedule entity.
 */

import { DomainError } from "./base/error.base.js";

/**
 * Thrown when an unexpected error occurs during the creation
 * of a ClassSchedule entity via the factory method.
 */
export class ClassScheduleCreationError extends DomainError {
  /**
   * @param originalError - Optional original runtime error for debugging.
   */
  constructor(originalError?: Error) {
    super(
      `An unexpected error occurred while creating the class schedule: ${originalError?.message}`,
    );
    this.cause = originalError;
  }
}

/**
 * Thrown when a schedule is ambiguously assigned to both a course and a lab group.
 */
export class ScheduleConflictError extends DomainError {
  constructor(
    message: string = "Schedule cannot belong to both a course and a lab group.",
  ) {
    super(message);
  }
}

/**
 * Thrown when a schedule is not assigned to either a course or a lab group.
 */
export class ScheduleAssignmentError extends DomainError {
  constructor(
    message: string = "Schedule must belong to either a course or a lab group.",
  ) {
    super(message);
  }
}
