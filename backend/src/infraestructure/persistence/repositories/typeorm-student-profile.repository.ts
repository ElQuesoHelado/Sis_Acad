/**
 * @file TypeORM implementation of the StudentProfile repository.
 */

import { EntityManager, In, type Repository } from "typeorm";
import { StudentProfile } from "@/domain/entities/profiles/student.profile.js";
import type { IStudentProfileRepository } from "@/domain/repositories/istudent-profile.repository.js";
import { StudentProfileModel } from "../models/student-profile.model.js";
import type { Id } from "@/domain/value-objects/index.js";
import { AppDataSource } from "../database.config.js";

/**
 * Repository implementation for the `StudentProfile` entity using TypeORM.
 *
 * Provides methods to find, save, and delete student profiles,
 * mapping between the domain entity (`StudentProfile`) and the persistence model (`StudentProfileModel`).
 * Implements the `IStudentProfileRepository` interface.
 */
export class TypeormStudentProfileRepository
  implements IStudentProfileRepository
{
  private ormRepo: Repository<StudentProfileModel>;

  /**
   * Constructor initializes the TypeORM repository for `StudentProfileModel`.
   */
  constructor(manager?: EntityManager) {
    const repository = manager ?? AppDataSource;
    this.ormRepo = repository.getRepository(StudentProfileModel);
  }

  /**
   * Maps a TypeORM model (`StudentProfileModel`) to a domain entity (`StudentProfile`).
   * @param model - The TypeORM model instance.
   * @returns The corresponding domain entity.
   */
  private toDomain = (model: StudentProfileModel): StudentProfile => {
    return StudentProfile.create({
      id: model.id,
      userId: model.userId,
      studentCode: model.studentCode,
    });
  };

  /**
   * Maps a domain entity (`StudentProfile`) to a plain object suitable for persistence.
   * @param entity - The domain entity.
   * @returns An object compatible with TypeORM save/update operations.
   */
  private toPersistence(entity: StudentProfile) {
    return {
      id: entity.id.value,
      userId: entity.userId.value,
      studentCode: entity.studentCode.value,
    };
  }

  /**
   * Finds a student profile by its unique ID.
   * @param id - The `Id` value object representing the profile ID.
   * @returns A promise resolving to the student profile or `null` if not found.
   */
  public async findById(id: Id): Promise<StudentProfile | null> {
    const model = await this.ormRepo.findOneBy({ id: id.value });
    return model ? this.toDomain(model) : null;
  }

  /** Finds multiple StudentProfiles by their IDs. */
  public async findByIds(ids: Id[]): Promise<StudentProfile[]> {
    const idValues = ids.map((id) => id.value);
    const models = await this.ormRepo.findBy({
      id: In(idValues),
    });
    return models.map(this.toDomain);
  }

  /**
   * Finds a student profile by the associated user ID.
   * @param userId - The `Id` value object representing the user ID.
   * @returns A promise resolving to the student profile or `null` if not found.
   */
  public async findByUserId(userId: Id): Promise<StudentProfile | null> {
    const model = await this.ormRepo.findOneBy({ userId: userId.value });
    return model ? this.toDomain(model) : null;
  }

  /**
   * Saves a student profile entity to the database.
   * If the profile already exists, it will be updated.
   * @param profile - The `StudentProfile` entity to save.
   * @returns A promise that resolves when the operation completes.
   */
  public async save(profile: StudentProfile): Promise<void> {
    const persistenceData = this.toPersistence(profile);
    await this.ormRepo.save(persistenceData);
  }

  /**
   * Deletes a student profile from the database by its unique ID.
   * @param id - The `Id` value object representing the profile ID.
   * @returns A promise that resolves when the operation completes.
   */
  public async delete(id: Id): Promise<void> {
    await this.ormRepo.delete({ id: id.value });
  }
}
