/**
 * @file TypeORM implementation of the TheoryGroup repository.
 */

import type { EntityManager, Repository } from "typeorm";
import { TheoryGroup } from "@/domain/entities/index.js";
import { type ITheoryGroupRepository } from "@/domain/repositories/itheory-group.repository.js";
import { TheoryGroupModel } from "../models/theory-group.model.js";
import type { Id, AcademicSemester } from "@/domain/value-objects/index.js";
import { AppDataSource } from "../database.config.js";

/**
 * Repository implementation for TheoryGroup using TypeORM.
 */
export class TypeormTheoryGroupRepository implements ITheoryGroupRepository {
  private ormRepo: Repository<TheoryGroupModel>;

  constructor(manager?: EntityManager) {
    const repository = manager ?? AppDataSource;
    this.ormRepo = repository.getRepository(TheoryGroupModel);
  }

  /**
   * Maps a TypeORM model to a domain TheoryGroup entity.
   * @param model - The database model.
   * @returns The domain entity.
   */
  private toDomain = (model: TheoryGroupModel): TheoryGroup => {
    return TheoryGroup.create({
      id: model.id,
      courseId: model.courseId,
      professorId: model.professorId,
      semester: model.semester.value,
      groupLetter: model.groupLetter,
    });
  };

  /**
   * Maps a domain TheoryGroup entity to a plain object for persistence.
   * @param entity - The domain entity.
   * @returns A plain object suitable for TypeORM.
   */
  private toPersistence = (entity: TheoryGroup) => {
    return {
      id: entity.id.value,
      courseId: entity.courseId.value,
      professorId: entity.professorId.value,
      semester: entity.semester,
      groupLetter: entity.groupLetter.value,
    };
  };

  /** Finds a TheoryGroup by its ID. */
  public async findById(id: Id): Promise<TheoryGroup | null> {
    const model = await this.ormRepo.findOneBy({ id: id.value });
    return model ? this.toDomain(model) : null;
  }

  /** Finds all TheoryGroups for a specific course in a given semester. */
  public async findByCourseAndSemester(
    courseId: Id,
    semester: AcademicSemester,
  ): Promise<TheoryGroup[]> {
    const models = await this.ormRepo.findBy({
      courseId: courseId.value,
      semester: semester,
    });
    return models.map(this.toDomain);
  }

  /** Finds all TheoryGroups taught by a professor in a given semester. */
  public async findByProfessorAndSemester(
    professorId: Id,
    semester: AcademicSemester,
  ): Promise<TheoryGroup[]> {
    const models = await this.ormRepo.findBy({
      professorId: professorId.value,
      semester: semester,
    });
    return models.map(this.toDomain);
  }

  /** Saves (creates or updates) a TheoryGroup. */
  public async save(theoryGroup: TheoryGroup): Promise<void> {
    const persistenceData = this.toPersistence(theoryGroup);
    await this.ormRepo.save(persistenceData);
  }

  /** Deletes a TheoryGroup by its ID. */
  public async delete(id: Id): Promise<void> {
    await this.ormRepo.delete({ id: id.value });
  }
}
