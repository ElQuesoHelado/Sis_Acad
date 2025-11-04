/**
 * @file src/domain/errors/lab.errors.ts
 * @fileoverview Defines domain-specific errors for Lab entities.
 */

import { DomainError } from "./base/error.base.js";

/**
 * Thrown when an unexpected error occurs during LabGroup creation.
 */
export class LabGroupCreationError extends DomainError {
  /**
   * @param originalError - The original runtime error that was caught.
   */
  constructor(originalError?: Error) {
    super(
      `Unexpected error while creating lab group: ${originalError?.message}`,
    );
    this.cause = originalError;
  }
}

/**
 * Thrown when attempting to enroll in a lab group that is full.
 */
export class LabGroupFullError extends DomainError {
  /**
   * @param message - Optional custom message for the error
   */
  constructor(message: string = "Lab group is full.") {
    super(message);
  }
}

/**
 * Thrown when a lab group is not found by ID.
 */
export class LabGroupNotFoundError extends DomainError {
  /**
   * @param id - The ID of the lab group that was not found
   */
  constructor(id: string) {
    super(`Lab group with ID ${id} was not found.`);
  }
}
