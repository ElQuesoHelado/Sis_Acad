import { DomainError } from "./base/error.base.js";

/**
 * Thrown when an unexpected (non-validation) error occurs
 * during the creation of a User entity via the factory method.
 */
export class UserCreationError extends DomainError {
  /**
   * @param originalError - Optional original runtime error for debugging purposes.
   */
  constructor(originalError?: Error) {
    super(
      `An unexpected error occurred while creating the user: ${originalError?.message}`,
    );
    // Preserve the original error as the cause for debugging
    this.cause = originalError;
  }
}

/**
 * Thrown when an unexpected (non-validation) error occurs
 * during the creation of a StudentProfile entity via the factory method.
 */
export class StudentProfileCreationError extends DomainError {
  /**
   * @param originalError - Optional original runtime error for debugging purposes.
   */
  constructor(originalError?: Error) {
    super(
      `An unexpected error occurred while creating the student profile: ${originalError?.message}`,
    );
    this.cause = originalError;
  }
}

/**
 * Thrown when an unexpected (non-validation) error occurs
 * during the creation of a TeacherProfile entity via the factory method.
 */
export class TeacherProfileCreationError extends DomainError {
  /**
   * @param originalError - Optional original runtime error for debugging purposes.
   */
  constructor(originalError?: Error) {
    super(
      `An unexpected error occurred while creating the teacher profile: ${originalError?.message}`,
    );
    this.cause = originalError;
  }
}
