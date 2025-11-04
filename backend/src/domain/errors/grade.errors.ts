/**
 * @fileoverview Defines domain-specific errors for the Grade entity.
 */

import { DomainError } from "./base/error.base.js";

/**
 * Thrown when an unexpected error (non-validation) occurs
 * during the creation of a Grade entity.
 */
export class GradeCreationError extends DomainError {
  /**
   * @param originalError - The original runtime error that was caught.
   */
  constructor(originalError?: Error) {
    super(`Unexpected error while creating grade: ${originalError?.message}`);
    this.cause = originalError;
  }
}

/**
 * Thrown when the grade type (e.g., "partial_1") is not a valid
 * member of the GradeType enum.
 */
export class InvalidGradeTypeError extends DomainError {
  /**
   * @param invalidType - The invalid grade type string.
   */
  constructor(invalidType: string) {
    super(`The grade type '${invalidType}' is not valid.`);
  }
}
