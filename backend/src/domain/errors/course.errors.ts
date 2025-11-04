/**
 * @file Defines domain-specific errors for the Course entity.
 */

import { DomainError } from "./base/error.base.js";

/** Thrown when an unexpected error occurs during Course creation. */
export class CourseCreationError extends DomainError {
  /**
   * @param originalError - The original runtime error that was caught.
   */
  constructor(originalError?: Error) {
    super(`Unexpected error while creating course: ${originalError?.message}`);
    this.cause = originalError;
  }
}
