/**
 * @file TypeORM implementation of the Attendance repository.
 */

import type { EntityManager } from "typeorm";
import { type Repository, In } from "typeorm";
import { Attendance } from "@/domain/entities/attendance.entity.js";
import { type IAttendanceRepository } from "@/domain/repositories/iattendance.repository.js";
import { AttendanceModel } from "../models/attendance.model.js";
import type { Id } from "@/domain/value-objects/index.js";
import type { ClassType } from "@/domain/enums/index.js";
import { AppDataSource } from "../database.config.js";

/**
 * Repository implementation for Attendance using TypeORM.
 */
export class TypeormAttendanceRepository implements IAttendanceRepository {
  private ormRepo: Repository<AttendanceModel>;

  constructor(manager?: EntityManager) {
    const repository = manager ?? AppDataSource;
    this.ormRepo = repository.getRepository(AttendanceModel);
  }
  /**
   * Maps a TypeORM AttendanceModel to a domain Attendance entity.
   * @param model - The database model.
   * @returns The domain entity.
   */
  private toDomain = (model: AttendanceModel): Attendance => {
    return Attendance.create({
      id: model.id,
      enrollmentId: model.enrollmentId,
      date: model.date,
      status: model.status,
      classType: model.classType,
    });
  };

  /**
   * Maps a domain Attendance entity to a plain object for persistence.
   * @param entity - The domain entity.
   * @returns A plain object suitable for TypeORM.
   */
  private toPersistence = (entity: Attendance) => {
    return {
      id: entity.id.value,
      enrollmentId: entity.enrollmentId.value,
      date: entity.date,
      status: entity.status,
      classType: entity.classType,
    };
  };

  /**
   * Finds an attendance by its ID.
   * @param id - The Attendance ID value object.
   * @returns The Attendance entity or null if not found.
   */
  public async findById(id: Id): Promise<Attendance | null> {
    const model = await this.ormRepo.findOneBy({ id: id.value });
    return model ? this.toDomain(model) : null;
  }

  /**
   * Finds all attendances for a specific enrollment.
   * @param enrollmentId - The enrollment ID value object.
   * @returns Array of Attendance entities.
   */
  public async findByEnrollmentId(enrollmentId: Id): Promise<Attendance[]> {
    const models = await this.ormRepo.findBy({
      enrollmentId: enrollmentId.value,
    });
    return models.map(this.toDomain);
  }

  /**
   * Finds a specific attendance by enrollment, date, and class type.
   * @param enrollmentId - The enrollment ID.
   * @param date - The date of the class.
   * @param classType - The type of class (theory or lab).
   * @returns The Attendance entity or null if not found.
   */
  public async findByEnrollmentDateAndType(
    enrollmentId: Id,
    date: Date,
    classType: ClassType,
  ): Promise<Attendance | null> {
    const model = await this.ormRepo.findOneBy({
      enrollmentId: enrollmentId.value,
      date: date,
      classType: classType,
    });
    return model ? this.toDomain(model) : null;
  }

  /**
   * Finds attendances for multiple enrollments on a specific date and class type.
   * @param enrollmentIds - Array of enrollment ID value objects.
   * @param date - The date of the class.
   * @param classType - The type of class (theory or lab).
   * @returns Array of Attendance entities.
   */
  public async findManyByEnrollmentsDateAndType(
    enrollmentIds: Id[],
    date: Date,
    classType: ClassType,
  ): Promise<Attendance[]> {
    const ids = enrollmentIds.map((id) => id.value);
    const models = await this.ormRepo.find({
      where: {
        enrollmentId: In(ids),
        date: date,
        classType: classType,
      },
    });
    return models.map(this.toDomain);
  }

  /**
   * Saves (creates or updates) an attendance.
   * @param attendance - The Attendance entity to save.
   */
  public async save(attendance: Attendance): Promise<void> {
    const persistenceData = this.toPersistence(attendance);
    await this.ormRepo.save(persistenceData);
  }

  /**
   * Saves multiple attendances at once.
   * @param attendances - Array of Attendance entities to save.
   */
  public async saveMany(attendances: Attendance[]): Promise<void> {
    const persistenceData = attendances.map(this.toPersistence);
    await this.ormRepo.save(persistenceData);
  }
}
