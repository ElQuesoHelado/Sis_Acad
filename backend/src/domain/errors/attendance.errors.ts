/**
 * @fileoverview Defines domain-specific errors for the Attendance entity.
 */

import { DomainError } from "./base/error.base.js";

/**
 * Thrown when an unexpected error (non-validation) occurs
 * during the creation of an Attendance entity.
 */
export class AttendanceCreationError extends DomainError {
  /**
   * @param originalError - The original runtime error that was caught.
   */
  constructor(originalError?: Error) {
    super(
      `Unexpected error while creating attendance record: ${originalError?.message}`,
    );
    this.cause = originalError;
  }
}

/**
 * Thrown when the attendance status (e.g., "present") is not
 * a valid member of the AttendanceStatus enum.
 */
export class InvalidAttendanceStatusError extends DomainError {
  constructor(invalidStatus: string) {
    super(`The attendance status '${invalidStatus}' is not valid.`);
  }
}

/**
 * Thrown when trying to record attendance for a future date.
 */
export class FutureAttendanceDateError extends DomainError {
  constructor() {
    super("Attendance date cannot be in the future.");
  }
}

/**
 * Thrown when the class type (e.g., "theory") is not
 * a valid member of the ClassType enum.
 */
export class InvalidClassTypeError extends DomainError {
  constructor(invalidType: string) {
    super(`The class type '${invalidType}' is not valid.`);
  }
}
