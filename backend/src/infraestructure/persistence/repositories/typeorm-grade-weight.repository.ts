/**
 * @file TypeORM implementation of the IGradeWeightRepository.
 */

import type { EntityManager, Repository } from "typeorm";
import { GradeWeight } from "@/domain/entities/grade-weight.entity.js";
import { type IGradeWeightRepository } from "@/domain/repositories/igrade-weight.repository.js";
import { GradeWeightModel } from "../models/grade-weight.model.js";
import type { Id } from "@/domain/value-objects/index.js";
import { AppDataSource } from "../database.config.js";

export class TypeormGradeWeightRepository implements IGradeWeightRepository {
  private ormRepo: Repository<GradeWeightModel>;

  constructor(manager?: EntityManager) {
    const repository = manager ?? AppDataSource;
    this.ormRepo = repository.getRepository(GradeWeightModel);
  }

  /**
   * Maps a DB model to a domain entity.
   */
  private toDomain = (model: GradeWeightModel): GradeWeight => {
    return GradeWeight.create({
      id: model.id,
      theoryGroupId: model.theoryGroupId,
      type: model.type,
      weight: Number(model.weight), // Convert DB decimal/string to number
    });
  };

  /**
   * Maps a domain entity to a persistence object.
   */
  private toPersistence = (entity: GradeWeight) => {
    return {
      id: entity.id.value,
      theoryGroupId: entity.theoryGroupId.value,
      type: entity.type,
      weight: entity.weight.value, // Get the number from the Percentage VO
    };
  };

  /**
   * Finds all weights for a specific theory group.
   */
  public async findByTheoryGroupId(theoryGroupId: Id): Promise<GradeWeight[]> {
    const models = await this.ormRepo.findBy({
      theoryGroupId: theoryGroupId.value,
    });
    return models.map(this.toDomain);
  }

  /**
   * Saves a single weight entity.
   */
  public async save(weight: GradeWeight): Promise<void> {
    const persistenceData = this.toPersistence(weight);
    await this.ormRepo.save(persistenceData);
  }

  /**
   * Saves multiple weight entities.
   */
  public async saveMany(weights: GradeWeight[]): Promise<void> {
    const persistenceData = weights.map(this.toPersistence);
    await this.ormRepo.save(persistenceData);
  }
}
