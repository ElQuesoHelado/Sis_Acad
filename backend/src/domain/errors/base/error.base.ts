/**
 * @file Base class for all domain layer errors.
 */

/**
 * Abstract base class for all domain (business) errors.
 * Allows identification of errors thrown by domain logic using `instanceof DomainError`.
 * @extends Error
 */
export abstract class DomainError extends Error {
  /**
   * Creates a new DomainError instance.
   * @param message - The specific error message.
   */
  constructor(message: string) {
    super(message);

    // Assigns the name of the child class (e.g., "InvalidEmailError")
    this.name = this.constructor.name;

    // Maintains a clean stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Maintains correct prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
