/**
 * @file TypeORM implementation of the Enrollment repository.
 */

import { EntityManager, In, type Repository } from "typeorm";
import { Enrollment } from "@/domain/entities/index.js";
import { type IEnrollmentRepository } from "@/domain/repositories/ienrollment.repository.js";
import { EnrollmentModel } from "../models/enrollment.model.js";
import type { Id } from "@/domain/value-objects/index.js";
import { AppDataSource } from "../database.config.js";

/**
 * Repository implementation for Enrollment using TypeORM.
 */
export class TypeormEnrollmentRepository implements IEnrollmentRepository {
  private ormRepo: Repository<EnrollmentModel>;

  constructor(manager?: EntityManager) {
    const repository = manager ?? AppDataSource;
    this.ormRepo = repository.getRepository(EnrollmentModel);
  }

  /**
   * Maps a TypeORM model to a domain Enrollment entity.
   * @param model - The database model.
   * @returns The domain entity.
   */
  private toDomain = (model: EnrollmentModel): Enrollment => {
    return Enrollment.create({
      id: model.id,
      studentId: model.studentId,
      theoryGroupId: model.theoryGroupId,
      labGroupId: model.labGroupId,
    });
  };

  /**
   * Maps a domain Enrollment entity to a plain object for persistence.
   * @param entity - The domain entity.
   * @returns A plain object suitable for TypeORM.
   */
  private toPersistence(entity: Enrollment) {
    return {
      id: entity.id.value,
      studentId: entity.studentId.value,
      theoryGroupId: entity.theoryGroupId.value,
      labGroupId: entity.labGroupId ? entity.labGroupId.value : null,
    };
  }

  /** Finds an Enrollment by its ID. */
  public async findById(id: Id): Promise<Enrollment | null> {
    const model = await this.ormRepo.findOneBy({ id: id.value });
    return model ? this.toDomain(model) : null;
  }

  /** Finds multiple Enrollments by their IDs. */
  public async findByIds(ids: Id[]): Promise<Enrollment[]> {
    const idValues = ids.map((id) => id.value);
    const models = await this.ormRepo.findBy({
      id: In(idValues),
    });
    return models.map(this.toDomain);
  }

  /** Finds an Enrollment by student ID and TheoryGroup ID. */
  public async findByStudentAndTheoryGroup(
    studentId: Id,
    theoryGroupId: Id,
  ): Promise<Enrollment | null> {
    const model = await this.ormRepo.findOneBy({
      studentId: studentId.value,
      theoryGroupId: theoryGroupId.value,
    });
    return model ? this.toDomain(model) : null;
  }

  /** Finds all Enrollments for a specific student. */
  public async findByStudent(studentId: Id): Promise<Enrollment[]> {
    const models = await this.ormRepo.findBy({ studentId: studentId.value });
    return models.map(this.toDomain);
  }

  /** Finds all Enrollments for a specific TheoryGroup. */
  public async findByTheoryGroup(theoryGroupId: Id): Promise<Enrollment[]> {
    const models = await this.ormRepo.findBy({
      theoryGroupId: theoryGroupId.value,
    });
    return models.map(this.toDomain);
  }

  /** Finds all Enrollments for a specific LabGroup. */
  public async findByLabGroup(labGroupId: Id): Promise<Enrollment[]> {
    const models = await this.ormRepo.findBy({
      labGroupId: labGroupId.value,
    });
    return models.map(this.toDomain);
  }

  /** Saves (creates or updates) an Enrollment. */
  public async save(enrollment: Enrollment): Promise<void> {
    const persistenceData = this.toPersistence(enrollment);
    await this.ormRepo.save(persistenceData);
  }

  /** Deletes an Enrollment by its ID. */
  public async delete(id: Id): Promise<void> {
    await this.ormRepo.delete({ id: id.value });
  }
}
