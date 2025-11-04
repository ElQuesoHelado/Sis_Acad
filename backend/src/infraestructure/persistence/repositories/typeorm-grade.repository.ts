/**
 * @file TypeORM implementation of the Grade repository.
 */

import type { EntityManager, Repository } from "typeorm";
import { Grade } from "@/domain/entities/grade.entity.js";
import { type IGradeRepository } from "@/domain/repositories/igrade.repository.js";
import { GradeModel } from "../models/grade.model.js";
import type { Id } from "@/domain/value-objects/index.js";
import type { GradeType } from "@/domain/enums/index.js";
import { AppDataSource } from "../database.config.js";

/**
 * Repository implementation for managing Grade entities using TypeORM.
 */
export class TypeormGradeRepository implements IGradeRepository {
  private ormRepo: Repository<GradeModel>;

  constructor(manager?: EntityManager) {
    const repository = manager ?? AppDataSource;
    this.ormRepo = repository.getRepository(GradeModel);
  }

  /**
   * Converts a GradeModel (TypeORM) to a Grade domain entity.
   * @param model - The GradeModel instance from the database.
   * @returns A domain Grade entity.
   */
  private toDomain = (model: GradeModel): Grade => {
    return Grade.create({
      id: model.id,
      enrollmentId: model.enrollmentId,
      type: model.type,
      score: Number(model.score), // Convert from DB decimal/string to VO
    });
  };

  /**
   * Converts a Grade domain entity to persistence format.
   * @param entity - The Grade domain entity.
   * @returns An object suitable for TypeORM save().
   */
  private toPersistence = (entity: Grade) => {
    return {
      id: entity.id.value,
      enrollmentId: entity.enrollmentId.value,
      type: entity.type,
      score: entity.score.value, // Numeric value of the VO
    };
  };

  /**
   * Finds a grade by its unique ID.
   * @param id - The Id VO of the grade.
   * @returns The Grade domain entity or null if not found.
   */
  public async findById(id: Id): Promise<Grade | null> {
    const model = await this.ormRepo.findOneBy({ id: id.value });
    return model ? this.toDomain(model) : null;
  }

  /**
   * Finds all grades associated with a specific enrollment.
   * @param enrollmentId - The Id VO of the enrollment.
   * @returns An array of Grade domain entities.
   */
  public async findByEnrollmentId(enrollmentId: Id): Promise<Grade[]> {
    const models = await this.ormRepo.findBy({
      enrollmentId: enrollmentId.value,
    });
    return models.map(this.toDomain);
  }

  /**
   * Finds a grade by enrollment and grade type.
   * @param enrollmentId - The Id VO of the enrollment.
   * @param type - The GradeType (e.g., PARTIAL_1).
   * @returns The Grade entity or null if not found.
   */
  public async findByEnrollmentAndType(
    enrollmentId: Id,
    type: GradeType,
  ): Promise<Grade | null> {
    const model = await this.ormRepo.findOneBy({
      enrollmentId: enrollmentId.value,
      type: type,
    });
    return model ? this.toDomain(model) : null;
  }

  /**
   * Saves (inserts or updates) a Grade entity in the database.
   * @param grade - The Grade domain entity.
   */
  public async save(grade: Grade): Promise<void> {
    const persistenceData = this.toPersistence(grade);
    await this.ormRepo.save(persistenceData);
  }

  /**
   * Saves (inserts or updates) multiple Grade entities in the database.
   * @param grades - An array of Grade domain entities.
   */
  public async saveMany(grades: Grade[]): Promise<void> {
    const persistenceData = grades.map(this.toPersistence);
    await this.ormRepo.save(persistenceData);
  }

  /**
   * Deletes a grade by its unique ID.
   * @param id - The Id VO of the grade.
   */
  public async delete(id: Id): Promise<void> {
    await this.ormRepo.delete({ id: id.value });
  }
}
