/**
 * @fileoverview Defines domain-specific errors for the RoomReservation entity.
 */

import { DomainError } from "./base/error.base.js";

/**
 * Thrown when an unexpected (non-validation) error occurs
 * during the creation of a RoomReservation entity.
 */
export class ReservationCreationError extends DomainError {
  /**
   * @param originalError - The original runtime error that was caught.
   */
  constructor(originalError?: Error) {
    super(
      `Unexpected error while creating room reservation: ${originalError?.message}`,
    );
    this.cause = originalError;
  }
}

/**
 * Thrown when the status (e.g., "reserved") is not a valid
 * member of the ReservationStatus enum.
 */
export class InvalidReservationStatusError extends DomainError {
  /**
   * @param invalidStatus - The invalid status string.
   */
  constructor(invalidStatus: string) {
    super(`The reservation status '${invalidStatus}' is invalid.`);
  }
}

/**
 * Thrown when the end time is not after the start time.
 */
export class InvalidReservationTimeError extends DomainError {
  constructor() {
    super("End time must be after start time for the reservation.");
  }
}

/**
 * Thrown when attempting to operate on a reservation that is already completed.
 */
export class CompletedReservationError extends DomainError {
  /**
   * @param operation - The action that was attempted (e.g., "cancel").
   */
  constructor(operation: string) {
    super(`Cannot ${operation} a reservation that is already completed.`);
  }
}

/**
 * Thrown when attempting to reserve a room time slot
 * that is already occupied (either by a fixed schedule or another reservation).
 */
export class ReservationConflictError extends DomainError {
  /**
   * @param message - The error message describing the conflict.
   */
  constructor(message: string) {
    super(message);
  }
}

/**
 * Thrown when a professor tries to reserve more than the weekly limit.
 */
export class ReservationLimitError extends DomainError {
  /**
   * @param limit - The maximum number of reservations allowed.
   */
  constructor(limit: number) {
    super(`Cannot reserve more than ${limit} classes per week.`);
  }
}
