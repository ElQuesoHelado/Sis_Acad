/**
 * @file Defines the interface for the User repository.
 */

import type { User } from "../entities/index.js";
import type { Id, Email } from "../value-objects/index.js";

/**
 * Interface for the User repository.
 * Defines data access methods for the User entity.
 */
export interface IUserRepository {
  /**
   * Finds a user by their unique ID.
   * @param id - The user's Id (Value Object).
   * @returns A promise that resolves to `User | null`.
   */
  findById(id: Id): Promise<User | null>;

  /**
   * Finds a user by their unique email address.
   * @param email - The user's Email (Value Object).
   * @returns A promise that resolves to `User | null`.
   */
  findByEmail(email: Email): Promise<User | null>;

  /**
   * Retrieves all users.
   * @returns A promise that resolves to an array of `User`.
   */
  findAll(): Promise<User[]>;

  /**
   * Finds multiple users by their unique IDs.
   * @param ids - An array of user Ids (Value Objects).
   * @returns A promise that resolves to an array of `User`.
   */
  findByIds(ids: Id[]): Promise<User[]>;

  /**
   * Saves (creates or updates) a user in persistence.
   * @param user - The `User` entity to save.
   * @returns A promise that resolves when the operation completes.
   */
  save(user: User): Promise<void>;

  /**
   * Deletes a user by their ID.
   * @param id - The user's Id (Value Object) to delete.
   * @returns A promise that resolves when the operation completes.
   */
  delete(id: Id): Promise<void>;
}
