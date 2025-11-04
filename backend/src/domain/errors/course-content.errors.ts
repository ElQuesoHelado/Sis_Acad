/**
 * @fileoverview Defines domain-specific errors for the CourseContent entity.
 */

import { DomainError } from "./base/error.base.js";

/**
 * Thrown when an unexpected (non-validation) error occurs
 * during the creation of a CourseContent entity.
 */
export class CourseContentCreationError extends DomainError {
  /**
   * @param originalError - The original runtime error that was caught.
   */
  constructor(originalError?: Error) {
    super(
      `Unexpected error while creating course content: ${originalError?.message}`,
    );
    this.cause = originalError;
  }
}

/**
 * Thrown when the topic status (e.g., "pending") is not
 * a valid member of the TopicStatus enum.
 */
export class InvalidTopicStatusError extends DomainError {
  /**
   * @param invalidStatus - The invalid status string that was provided.
   */
  constructor(invalidStatus: string) {
    super(`The topic status '${invalidStatus}' is not valid.`);
  }
}
