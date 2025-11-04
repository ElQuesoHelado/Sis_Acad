/**
 * @file src/domain/errors/classroom.errors.ts
 * @fileoverview Defines domain-specific errors for the Classroom entity.
 */

import { DomainError } from "./base/error.base.js";

/**
 * Thrown when an unexpected (non-validation) error occurs
 * during the creation of a Classroom entity via the factory method.
 */
export class ClassroomCreationError extends DomainError {
  /**
   * @param originalError - Optional original runtime error for debugging purposes.
   */
  constructor(originalError?: Error) {
    super(
      `An unexpected error occurred while creating the classroom: ${originalError?.message}`,
    );
    this.cause = originalError;
  }
}
