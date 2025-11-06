export class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User with ID ${userId} was not found.`);
    this.name = "UserNotFoundError";
  }
}
