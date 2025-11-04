/**
 * @fileoverview Defines domain-specific errors for the Enrollment entity.
 */

import { DomainError } from "./base/error.base.js";

/** Thrown when an unexpected error occurs during Enrollment creation. */
export class EnrollmentCreationError extends DomainError {
  /**
   * @param originalError - The original runtime error that was caught.
   */
  constructor(originalError?: Error) {
    super(
      `Unexpected error while creating enrollment: ${originalError?.message}`,
    );
    this.cause = originalError;
  }
}

/**
 * Thrown when a student tries to enroll in a lab group
 * for a course they are not enrolled in.
 */
export class CourseMismatchError extends DomainError {
  constructor(message: string = "Lab group does not match the theory course.") {
    super(message);
  }
}

/**
 * Thrown when a student tries to enroll in a lab
 * when they are already assigned to one.
 */
export class StudentAlreadyEnrolledInLabError extends DomainError {
  constructor() {
    super("Student is already enrolled in a lab group for this course.");
  }
}

/**
 * Thrown when an operation is attempted on an enrollment that doesn't exist.
 */
export class EnrollmentNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Enrollment with ID ${id} was not found.`);
  }
}

/**
 * Thrown during a bulk enrollment operation when one or more selections fail.
 */
export class BulkEnrollmentError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = "BulkEnrollmentError";
  }
}
