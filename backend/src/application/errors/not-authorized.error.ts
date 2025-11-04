/**
 * Application-level error for authorization failures.
 */
export class NotAuthorizedError extends Error {
  constructor(
    message: string = "You are not authorized to perform this action.",
  ) {
    super(message);
    this.name = "NotAuthorizedError";
  }
}
