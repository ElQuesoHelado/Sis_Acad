/**
 * @file TypeORM implementation of the Course repository.
 */

import type { EntityManager, Repository } from "typeorm";
import type { ICourseRepository } from "@/domain/repositories/icourse.repository.js";
import { CourseModel } from "../models/course.model.js";
import type { Id, CourseCode } from "@/domain/value-objects/index.js";
import { AppDataSource } from "../database.config.js";
import { Course } from "@/domain/entities/course.entity.js";

/**
 * Repository implementation for the `Course` entity using TypeORM.
 *
 * Provides methods to find, save, and delete courses from the database,
 * mapping between the domain entity (`Course`) and the persistence model (`CourseModel`).
 * Implements the `ICourseRepository` interface.
 */
export class TypeormCourseRepository implements ICourseRepository {
  private ormRepo: Repository<CourseModel>;

  /**
   * Constructor initializes the TypeORM repository for `CourseModel`.
   */
  constructor(manager?: EntityManager) {
    const repository = manager ?? AppDataSource;
    this.ormRepo = repository.getRepository(CourseModel);
  }

  /**
   * Maps a TypeORM model (`CourseModel`) to a domain entity (`Course`).
   * @param model - The TypeORM model instance.
   * @returns The corresponding domain entity.
   */
  private toDomain = (model: CourseModel): Course => {
    return Course.create({
      id: model.id,
      code: model.code,
      name: model.name,
      credits: model.credits,
      type: model.type,
    });
  };

  /**
   * Maps a domain entity (`Course`) to a plain object suitable for persistence.
   * @param entity - The domain entity.
   * @returns An object compatible with TypeORM save/update operations.
   */
  private toPersistence(entity: Course) {
    return {
      id: entity.id.value,
      code: entity.code.value,
      name: entity.name,
      credits: entity.credits.value,
      type: entity.type,
    };
  }

  /**
   * Finds a course by its unique ID (UUID).
   * @param id - The `Id` value object representing the course ID.
   * @returns A promise resolving to the course entity or `null` if not found.
   */
  public async findById(id: Id): Promise<Course | null> {
    const model = await this.ormRepo.findOneBy({ id: id.value });
    return model ? this.toDomain(model) : null;
  }

  /**
   * Finds a course by its unique code (e.g., "11701101").
   * @param code - The `CourseCode` value object representing the course code.
   * @returns A promise resolving to the course entity or `null` if not found.
   */
  public async findByCode(code: CourseCode): Promise<Course | null> {
    const model = await this.ormRepo.findOneBy({ code: code.value });
    return model ? this.toDomain(model) : null;
  }

  /**
   * Retrieves all courses from the database.
   * @returns A promise resolving to an array of course entities.
   */
  public async findAll(): Promise<Course[]> {
    const models = await this.ormRepo.find();
    return models.map((model) => this.toDomain(model));
  }

  /**
   * Saves a course entity to the database.
   * If the course already exists, it will be updated.
   * @param course - The course entity to save.
   * @returns A promise that resolves when the operation completes.
   */
  public async save(course: Course): Promise<void> {
    const persistenceData = this.toPersistence(course);
    await this.ormRepo.save(persistenceData);
  }

  /**
   * Deletes a course from the database by its unique ID.
   * @param id - The `Id` value object representing the course ID.
   * @returns A promise that resolves when the operation completes.
   */
  public async delete(id: Id): Promise<void> {
    await this.ormRepo.delete({ id: id.value });
  }
}
