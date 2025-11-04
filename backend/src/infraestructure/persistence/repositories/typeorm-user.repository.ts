/**
 * @file TypeORM implementation of the User repository.
 */

import { EntityManager, In, type Repository } from "typeorm";
import { User } from "@/domain/entities/index.js";
import type { IUserRepository } from "@/domain/repositories/iuser.repository.js";
import { UserModel } from "../models/user.model.js";
import type { Id, Email } from "@/domain/value-objects/index.js";
import { AppDataSource } from "../database.config.js";

/**
 * Repository implementation for the `User` entity using TypeORM.
 *
 * Provides methods to find, save, and delete users from the database,
 * mapping between the domain entity (`User`) and the persistence model (`UserModel`).
 * Implements the `IUserRepository` interface.
 */
export class TypeormUserRepository implements IUserRepository {
  private ormRepo: Repository<UserModel>;

  /**
   * Constructor initializes the TypeORM repository for `UserModel`.
   */
  constructor(manager?: EntityManager) {
    const repository = manager ?? AppDataSource;
    this.ormRepo = repository.getRepository(UserModel);
  }

  /**
   * Maps a TypeORM model (`UserModel`) to a domain entity (`User`).
   * @param model - The TypeORM model instance.
   * @returns The corresponding domain entity.
   */
  private toDomain = (model: UserModel): User => {
    return User.create({
      id: model.id,
      email: model.email,
      password: model.password,
      role: model.role,
      name: model.name,
      surname: model.surname,
      birthdate: model.birthdate,
      status: model.status,
      // picture: model.picture // Uncomment if implemented
    });
  };

  /**
   * Maps a domain entity (`User`) to a plain object suitable for persistence.
   * @param entity - The domain entity.
   * @returns An object compatible with TypeORM save/update operations.
   */
  private toPersistence(entity: User) {
    return {
      id: entity.id.value,
      email: entity.email.value,
      password: entity.password,
      role: entity.role,
      name: entity.name,
      surname: entity.surname,
      birthdate: entity.birthdate.value,
      status: entity.status,
      // picture: entity.picture // Uncomment if implemented
    };
  }

  /**
   * Finds a user by their unique ID (UUID).
   * @param id - The `Id` value object representing the user ID.
   * @returns A promise resolving to the user entity or `null` if not found.
   */
  public async findById(id: Id): Promise<User | null> {
    const model = await this.ormRepo.findOneBy({ id: id.value });
    return model ? this.toDomain(model) : null;
  }

  /**
   * Finds a user by their unique email address.
   * @param email - The `Email` value object representing the user's email.
   * @returns A promise resolving to the user entity or `null` if not found.
   */
  public async findByEmail(email: Email): Promise<User | null> {
    const model = await this.ormRepo.findOneBy({ email: email.value });
    return model ? this.toDomain(model) : null;
  }

  /**
   * Retrieves all users from the database.
   * @returns A promise resolving to an array of user entities.
   */
  public async findAll(): Promise<User[]> {
    const models = await this.ormRepo.find();
    return models.map((model) => this.toDomain(model));
  }

  /** Finds multiple Users by their IDs. */
  public async findByIds(ids: Id[]): Promise<User[]> {
    const idValues = ids.map((id) => id.value);
    const models = await this.ormRepo.findBy({
      id: In(idValues),
    });
    return models.map(this.toDomain);
  }

  /**
   * Saves a user entity to the database.
   * If the user already exists, it will be updated.
   * @param user - The user entity to save.
   * @returns A promise that resolves when the operation completes.
   */
  public async save(user: User): Promise<void> {
    const persistenceData = this.toPersistence(user);
    await this.ormRepo.save(persistenceData);
  }

  /**
   * Deletes a user from the database by their unique ID.
   * @param id - The `Id` value object representing the user ID.
   * @returns A promise that resolves when the operation completes.
   */
  public async delete(id: Id): Promise<void> {
    await this.ormRepo.delete({ id: id.value });
  }
}
