/**
 * @file TypeORM implementation of the Classroom repository.
 */

import type { EntityManager, Repository } from "typeorm";
import { Classroom } from "@/domain/entities/index.js";
import { type IClassroomRepository } from "@/domain/repositories/iclassroom.repository.js";
import { ClassroomModel } from "../models/classroom.model.js";
import type { Id } from "@/domain/value-objects/index.js";
import type { ClassType } from "@/domain/enums/index.js";
import { AppDataSource } from "../database.config.js";

/**
 * TypeORM-based repository implementation for the Classroom aggregate.
 * Provides database access operations for Classroom entities.
 */
export class TypeormClassroomRepository implements IClassroomRepository {
  private ormRepo: Repository<ClassroomModel>;

  constructor(manager?: EntityManager) {
    const repository = manager ?? AppDataSource;
    this.ormRepo = repository.getRepository(ClassroomModel);
  }
  /**
   * Maps a TypeORM model (ClassroomModel) into a domain entity (Classroom).
   * @param model - The database model.
   * @returns The corresponding domain entity.
   */
  private toDomain = (model: ClassroomModel): Classroom => {
    return Classroom.create({
      id: model.id,
      name: model.name,
      type: model.type,
      capacity: model.capacity,
    });
  };

  /**
   * Maps a domain entity (Classroom) into a persistence-friendly object
   * suitable for saving or updating using TypeORM.
   * @param entity - The domain entity.
   * @returns A plain object ready for persistence.
   */
  private toPersistence(entity: Classroom) {
    return {
      id: entity.id.value,
      name: entity.name,
      type: entity.type,
      capacity: entity.capacity,
    };
  }

  /**
   * Finds a classroom by its unique identifier.
   * @param id - The Id value object.
   * @returns A Classroom entity if found, otherwise null.
   */
  public async findById(id: Id): Promise<Classroom | null> {
    const model = await this.ormRepo.findOneBy({ id: id.value });
    return model ? this.toDomain(model) : null;
  }

  /**
   * Retrieves all classrooms of a specific type (THEORY or LAB).
   * @param type - The classroom type.
   * @returns An array of Classroom entities.
   */
  public async findByType(type: ClassType): Promise<Classroom[]> {
    const models = await this.ormRepo.findBy({ type });
    return models.map((m) => this.toDomain(m));
  }

  /**
   * Retrieves all classrooms stored in the system.
   * @returns An array of Classroom entities.
   */
  public async findAll(): Promise<Classroom[]> {
    const models = await this.ormRepo.find();
    return models.map((m) => this.toDomain(m));
  }

  /**
   * Persists a Classroom entity (create or update).
   * @param classroom - The entity to save.
   */
  public async save(classroom: Classroom): Promise<void> {
    const persistenceData = this.toPersistence(classroom);
    await this.ormRepo.save(persistenceData);
  }

  /**
   * Removes a classroom from the database by its identifier.
   * @param id - The Id value object.
   */
  public async delete(id: Id): Promise<void> {
    await this.ormRepo.delete({ id: id.value });
  }
}
