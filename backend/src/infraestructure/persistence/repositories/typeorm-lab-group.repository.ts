/**
 * @file TypeORM implementation of the LabGroup repository.
 */

import type { EntityManager, Repository } from "typeorm";
import { LabGroup } from "@/domain/entities/index.js";
import { type ILabGroupRepository } from "@/domain/repositories/ilab-group.repository.js";
import { LabGroupModel } from "../models/lab-group.model.js";
import type { Id } from "@/domain/value-objects/index.js";
import { AppDataSource } from "../database.config.js";

/**
 * Repository implementation for LabGroup using TypeORM.
 */
export class TypeormLabGroupRepository implements ILabGroupRepository {
  private ormRepo: Repository<LabGroupModel>;

  constructor(manager?: EntityManager) {
    const repository = manager ?? AppDataSource;
    this.ormRepo = repository.getRepository(LabGroupModel);
  }

  /**
   * Maps a TypeORM model to a domain LabGroup entity.
   * @param model - The database model.
   * @returns The domain entity.
   */
  private toDomain = (model: LabGroupModel): LabGroup => {
    return LabGroup.create({
      id: model.id,
      courseId: model.courseId,
      professorId: model.professorId,
      groupLetter: model.groupLetter,
      capacity: model.capacity,
      currentEnrollment: model.currentEnrollment,
    });
  };

  /**
   * Maps a domain LabGroup entity to a plain object for persistence.
   * @param entity - The domain entity.
   * @returns A plain object suitable for TypeORM.
   */
  private toPersistence(entity: LabGroup) {
    return {
      id: entity.id.value,
      courseId: entity.courseId.value,
      professorId: entity.professorId.value,
      groupLetter: entity.groupLetter.value,
      capacity: entity.capacity,
      currentEnrollment: entity.currentEnrollment,
    };
  }

  /** Finds a LabGroup by its ID. */
  public async findById(id: Id): Promise<LabGroup | null> {
    const model = await this.ormRepo.findOneBy({ id: id.value });
    return model ? this.toDomain(model) : null;
  }

  /** Finds all LabGroups for a specific course. */
  public async findByCourse(courseId: Id): Promise<LabGroup[]> {
    const models = await this.ormRepo.findBy({
      courseId: courseId.value,
    });
    return models.map(this.toDomain);
  }

  /** Finds all LabGroups for a specific professor. */
  public async findByProfessor(professorId: Id): Promise<LabGroup[]> {
    const models = await this.ormRepo.findBy({
      professorId: professorId.value,
    });
    return models.map(this.toDomain);
  }

  /** Saves (creates or updates) a LabGroup. */
  public async save(labGroup: LabGroup): Promise<void> {
    const persistenceData = this.toPersistence(labGroup);
    await this.ormRepo.save(persistenceData);
  }

  /** Deletes a LabGroup by its ID. */
  public async delete(id: Id): Promise<void> {
    await this.ormRepo.delete({ id: id.value });
  }

  public async findAll(): Promise<LabGroup[]> {
    const models = await this.ormRepo.find();
    return models.map(this.toDomain);
  }
}
