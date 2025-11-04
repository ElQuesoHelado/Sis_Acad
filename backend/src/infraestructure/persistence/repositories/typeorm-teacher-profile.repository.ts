/**
 * @file TypeORM implementation of the TeacherProfile repository.
 */

import type { EntityManager, Repository } from "typeorm";
import { TeacherProfile } from "@/domain/entities/profiles/teacher.profile.js";
import { type ITeacherProfileRepository } from "@/domain/repositories/iteacher-profile.repository.js";
import { TeacherProfileModel } from "../models/teacher-profile.model.js";
import type { Id } from "@/domain/value-objects/index.js";
import { AppDataSource } from "../database.config.js";

/**
 * Repository implementation for TeacherProfile using TypeORM.
 */
export class TypeormTeacherProfileRepository
  implements ITeacherProfileRepository
{
  private ormRepo: Repository<TeacherProfileModel>;

  constructor(manager?: EntityManager) {
    const repository = manager ?? AppDataSource;
    this.ormRepo = repository.getRepository(TeacherProfileModel);
  }

  /**
   * Maps a TypeORM model to a domain TeacherProfile entity.
   * @param model - The database model.
   * @returns The domain entity.
   */
  private toDomain = (model: TeacherProfileModel): TeacherProfile => {
    return TeacherProfile.create({
      id: model.id,
      userId: model.userId,
      specialization: model.specialization,
    });
  };

  /**
   * Maps a domain TeacherProfile entity to a plain object for persistence.
   * @param entity - The domain entity.
   * @returns A plain object suitable for TypeORM.
   */
  private toPersistence(entity: TeacherProfile) {
    return {
      id: entity.id.value,
      userId: entity.userId.value,
      specialization: entity.specialization,
    };
  }

  /** Finds a TeacherProfile by its ID. */
  public async findById(id: Id): Promise<TeacherProfile | null> {
    const model = await this.ormRepo.findOneBy({ id: id.value });
    return model ? this.toDomain(model) : null;
  }

  /** Finds a TeacherProfile by the associated User ID. */
  public async findByUserId(userId: Id): Promise<TeacherProfile | null> {
    const model = await this.ormRepo.findOneBy({ userId: userId.value });
    return model ? this.toDomain(model) : null;
  }

  /** Saves (creates or updates) a TeacherProfile. */
  public async save(profile: TeacherProfile): Promise<void> {
    const persistenceData = this.toPersistence(profile);
    await this.ormRepo.save(persistenceData);
  }

  /** Deletes a TeacherProfile by its ID. */
  public async delete(id: Id): Promise<void> {
    await this.ormRepo.delete({ id: id.value });
  }
}
