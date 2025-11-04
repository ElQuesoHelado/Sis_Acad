/**
 * @file Defines domain-specific errors for the TheoryGroup entity.
 */

import { DomainError } from "./base/error.base.js";

/**
 * Thrown when an unexpected (non-validation) error occurs
 * during the creation of a TheoryGroup entity via the factory method.
 */
export class TheoryGroupCreationError extends DomainError {
  /**
   * @param originalError - Optional original runtime error for debugging purposes.
   */
  constructor(originalError?: Error) {
    super(
      `An unexpected error occurred while creating the theory group: ${originalError?.message}`,
    );
    this.cause = originalError;
  }
}
