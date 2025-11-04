/**
 * @file TypeORM implementation of the ClassSchedule repository.
 */

import type { EntityManager, Repository } from "typeorm";
import { ClassSchedule } from "@/domain/entities/index.js";
import { type IClassScheduleRepository } from "@/domain/repositories/iclass-schedule.repository.js";
import { ClassScheduleModel } from "../models/class-schedule.model.js";
import type { Id, AcademicSemester } from "@/domain/value-objects/index.js";
import { AppDataSource } from "../database.config.js";

/**
 * TypeORM-based repository implementation for the ClassSchedule aggregate.
 * Provides database access operations for ClassSchedule entities.
 */
export class TypeormClassScheduleRepository
  implements IClassScheduleRepository
{
  private ormRepo: Repository<ClassScheduleModel>;

  constructor(manager?: EntityManager) {
    const repository = manager ?? AppDataSource;
    this.ormRepo = repository.getRepository(ClassScheduleModel);
  }

  /**
   * Maps a TypeORM model (ClassScheduleModel) into a domain entity (ClassSchedule).
   * Value Object transformers defined in the model automatically convert
   * semester, startTime, and endTime fields.
   *
   * @param model - The database model.
   * @returns The corresponding domain entity.
   */
  private toDomain = (model: ClassScheduleModel): ClassSchedule => {
    return ClassSchedule.create({
      id: model.id,
      classroomId: model.classroomId,
      semester: model.semester.value,
      timeSlot: {
        day: model.day,
        startTime: model.startTime.value,
        endTime: model.endTime.value,
      },
      // Important mapping: The domain's courseId is stored as theoryGroupId in the DB.
      courseId: model.theoryGroupId,
      labGroupId: model.labGroupId,
    });
  };

  /**
   * Maps a domain entity (ClassSchedule) into a persistence-ready object
   * suitable for storage via TypeORM.
   * Transformers in the model will correctly handle Value Objects.
   *
   * @param entity - The domain entity.
   * @returns A plain object ready for persistence.
   */
  private toPersistence(entity: ClassSchedule) {
    return {
      id: entity.id.value,
      classroomId: entity.classroomId.value,
      semester: entity.semester,
      day: entity.timeSlot.day,
      startTime: entity.timeSlot.startTime,
      endTime: entity.timeSlot.endTime,
      // Important mapping: domain courseId → DB theoryGroupId
      theoryGroupId: entity.courseId ? entity.courseId.value : null,
      labGroupId: entity.labGroupId ? entity.labGroupId.value : null,
    };
  }

  /**
   * Finds a schedule by its unique identifier.
   * @param id - The Id value object.
   * @returns A ClassSchedule entity if found, otherwise null.
   */
  public async findById(id: Id): Promise<ClassSchedule | null> {
    const model = await this.ormRepo.findOneBy({ id: id.value });
    return model ? this.toDomain(model) : null;
  }

  /**
   * Finds the schedule assigned to a specific TheoryGroup.
   * @param theoryGroupId - The Id of the TheoryGroup.
   * @returns A ClassSchedule entity if found, otherwise null.
   */
  public async findByTheoryGroup(theoryGroupId: Id): Promise<ClassSchedule[]> {
    const models = await this.ormRepo.findBy({
      theoryGroupId: theoryGroupId.value,
    });

    return models.map(this.toDomain);
  }

  /**
   * Finds the schedule assigned to a specific LabGroup.
   * @param labGroupId - The Id of the LabGroup.
   * @returns A ClassSchedule entity if found, otherwise null.
   */
  public async findByLabGroup(labGroupId: Id): Promise<ClassSchedule[]> {
    const models = await this.ormRepo.findBy({
      labGroupId: labGroupId.value,
    });
    return models.map(this.toDomain);
  }

  /**
   * Retrieves all schedules assigned to a specific classroom during a given semester.
   *
   * @param classroomId - The Id of the classroom.
   * @param semester - The AcademicSemester value object.
   * @returns An array of ClassSchedule entities.
   */
  public async findSchedulesByClassroomAndSemester(
    classroomId: Id,
    semester: AcademicSemester,
  ): Promise<ClassSchedule[]> {
    const models = await this.ormRepo.findBy({
      classroomId: classroomId.value,
      semester: semester, // Transformer handles VO conversion
    });
    return models.map((m) => this.toDomain(m));
  }

  /**
   * Persists a ClassSchedule entity (create or update).
   * @param schedule - The entity to save.
   */
  public async save(schedule: ClassSchedule): Promise<void> {
    const data = this.toPersistence(schedule);
    await this.ormRepo.save(data);
  }

  /**
   * Removes a schedule from the database by its identifier.
   * @param id - The Id value object.
   */
  public async delete(id: Id): Promise<void> {
    await this.ormRepo.delete({ id: id.value });
  }
}
