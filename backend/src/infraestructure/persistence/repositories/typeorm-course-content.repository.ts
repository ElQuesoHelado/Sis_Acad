/**
 * @file TypeORM implementation of the CourseContent repository.
 */

import type { EntityManager, Repository } from "typeorm";
import { CourseContent } from "@/domain/entities/course-content.entity.js";
import { type ICourseContentRepository } from "@/domain/repositories/icourse-content.repository.js";
import { CourseContentModel } from "../models/course-content.model.js";
import type { Id } from "@/domain/value-objects/index.js";
import { AppDataSource } from "../database.config.js";

/**
 * Repository implementation for CourseContent using TypeORM.
 */
export class TypeormCourseContentRepository
  implements ICourseContentRepository
{
  private ormRepo: Repository<CourseContentModel>;

  constructor(manager?: EntityManager) {
    // 3. Constructor modificado
    const repository = manager ?? AppDataSource;
    this.ormRepo = repository.getRepository(CourseContentModel);
  }

  /**
   * Maps a TypeORM CourseContentModel to a domain CourseContent entity.
   * @param model - The database model.
   * @returns The domain entity.
   */
  private toDomain = (model: CourseContentModel): CourseContent => {
    return CourseContent.create({
      id: model.id,
      theoryGroupId: model.theoryGroupId,
      week: model.week,
      topicName: model.topicName,
      status: model.status,
    });
  };

  /**
   * Maps a domain CourseContent entity to a plain object for persistence.
   * @param entity - The domain entity.
   * @returns A plain object suitable for TypeORM.
   */
  private toPersistence = (entity: CourseContent) => {
    return {
      id: entity.id.value,
      theoryGroupId: entity.theoryGroupId.value,
      week: entity.week,
      topicName: entity.topicName,
      status: entity.status,
    };
  };

  /**
   * Finds a CourseContent by its ID.
   * @param id - The CourseContent ID value object.
   * @returns The CourseContent entity or null if not found.
   */
  public async findById(id: Id): Promise<CourseContent | null> {
    const model = await this.ormRepo.findOneBy({ id: id.value });
    return model ? this.toDomain(model) : null;
  }

  /**
   * Finds all CourseContents for a specific TheoryGroup.
   * Ordered by week ascending.
   * @param theoryGroupId - The TheoryGroup ID value object.
   * @returns Array of CourseContent entities.
   */
  public async findByTheoryGroupId(
    theoryGroupId: Id,
  ): Promise<CourseContent[]> {
    const models = await this.ormRepo.find({
      where: { theoryGroupId: theoryGroupId.value },
      order: { week: "ASC" },
    });
    return models.map(this.toDomain);
  }

  /**
   * Saves (creates or updates) a CourseContent.
   * @param topic - The CourseContent entity to save.
   */
  public async save(topic: CourseContent): Promise<void> {
    const persistenceData = this.toPersistence(topic);
    await this.ormRepo.save(persistenceData);
  }

  /**
   * Saves multiple CourseContent entities at once.
   * @param topics - Array of CourseContent entities to save.
   */
  public async saveMany(topics: CourseContent[]): Promise<void> {
    const persistenceData = topics.map(this.toPersistence);
    await this.ormRepo.save(persistenceData);
  }

  /**
   * Deletes a CourseContent by its ID.
   * @param id - The CourseContent ID value object.
   */
  public async delete(id: Id): Promise<void> {
    await this.ormRepo.delete({ id: id.value });
  }
}
