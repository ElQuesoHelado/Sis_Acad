/**
 * @file Defines domain-specific errors for the GradeWeight entity.
 */

import { DomainError } from "./base/error.base.js";

/**
 * Thrown when an unexpected (non-validation) error occurs
 * during the creation of a GradeWeight entity.
 */
export class GradeWeightCreationError extends DomainError {
  /**
   * @param originalError - Optional original runtime error.
   */
  constructor(originalError?: Error) {
    super(
      `Unexpected error while creating grade weight: ${originalError?.message}`,
    );
    this.cause = originalError;
  }
}

/**
 * Thrown when the sum of weights for a theory group does not equal 100.
 */
export class InvalidGradeWeightSumError extends DomainError {
  /**
   * @param sum - The incorrect sum that was calculated.
   */
  constructor(sum: number) {
    super(`Grade weights must sum to 100, but received ${sum}.`);
  }
}

/**
 * Thrown when an invalid GradeType is used for a weight.
 */
export class InvalidGradeWeightTypeError extends DomainError {
  /**
   * @param invalidType - The invalid type string.
   */
  constructor(invalidType: string) {
    super(`'${invalidType}' is not a valid GradeType for a weight.`);
  }
}
