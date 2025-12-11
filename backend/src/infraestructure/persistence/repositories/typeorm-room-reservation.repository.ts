/**
 * @file TypeORM implementation of the RoomReservation repository.
 */

import type { EntityManager } from "typeorm";
import { type Repository, LessThan, MoreThan, Between } from "typeorm";
import { RoomReservation } from "@/domain/entities/room-reservation.entity.js";
import { type IRoomReservationRepository } from "@/domain/repositories/iroom-reservation.repository.js";
import { RoomReservationModel } from "../models/room-reservation.model.js";
import type {
  Id,
  AcademicSemester,
  TimeOfDay,
} from "@/domain/value-objects/index.js";
import { ReservationStatus } from "@/domain/enums/index.js";
import { AppDataSource } from "../database.config.js";

/**
 * TypeORM repository implementation for the RoomReservation aggregate.
 * Handles mapping between domain entities and persistence models.
 */
export class TypeormRoomReservationRepository
  implements IRoomReservationRepository
{
  private ormRepo: Repository<RoomReservationModel>;

  /**
   * Constructs the repository.
   * @param manager - Optional TypeORM EntityManager for transactional context.
   */
  constructor(manager?: EntityManager) {
    const repository = manager ?? AppDataSource;
    this.ormRepo = repository.getRepository(RoomReservationModel);
  }

  /**
   * Maps a TypeORM model to a domain RoomReservation entity.
   * @param model - The database model.
   * @returns The corresponding domain entity.
   */
  private toDomain = (model: RoomReservationModel): RoomReservation => {
    let dateString: string;

    if (model.date instanceof Date) {
        dateString = model.date.toISOString().split('T')[0]!;
    } else {
        dateString = model.date as unknown as string;
    }

    return RoomReservation.create({
      id: model.id,
      classroomId: model.classroomId,
      professorId: model.professorId,
      semester: model.semester.value,
      status: model.status,
      date: dateString,
      startTime: model.startTime.value,
      endTime: model.endTime.value,
      notes: model.notes ?? undefined,
    });
  };

  /**
   * Maps a domain RoomReservation entity to a plain object for TypeORM persistence.
   * @param entity - The domain entity.
   * @returns Persistence-ready object.
   */
  private toPersistence(entity: RoomReservation) {
    return {
      id: entity.id.value,
      classroomId: entity.classroomId.value,
      professorId: entity.professorId.value,
      semester: entity.semester,
      status: entity.status,
      date: entity.date.isoString,
      startTime: entity.startTime,
      endTime: entity.endTime,
      notes: entity.notes ?? null,
    };
  }

  /** @inheritdoc */
  public async findById(id: Id): Promise<RoomReservation | null> {
    const model = await this.ormRepo.findOneBy({ id: id.value });
    return model ? this.toDomain(model) : null;
  }

  /** @inheritdoc */
  public async findByProfessorAndSemester(
    professorId: Id,
    semester: AcademicSemester,
  ): Promise<RoomReservation[]> {
    const models = await this.ormRepo.findBy({
      professorId: professorId.value,
      semester: semester,
    });
    return models.map(this.toDomain);
  }

  /** @inheritdoc */
  public async findByClassroomAndSemester(
    classroomId: Id,
    semester: AcademicSemester,
  ): Promise<RoomReservation[]> {
    const models = await this.ormRepo.findBy({
      classroomId: classroomId.value,
      semester: semester,
    });
    return models.map(this.toDomain);
  }

  /** @inheritdoc */
  public async findOverlappingReservations(
    classroomId: Id,
    semester: AcademicSemester,
    date: Date,
    startTime: TimeOfDay,
    endTime: TimeOfDay,
  ): Promise<RoomReservation[]> {
    const models = await this.ormRepo.find({
      where: {
        classroomId: classroomId.value,
        semester: semester,
        date: date,
        status: ReservationStatus.RESERVED,
        startTime: LessThan(endTime.value),
        endTime: MoreThan(startTime.value),
      },
    });
    return models.map(this.toDomain);
  }

  /** @inheritdoc */
  public async countByProfessorAndDateRange(
    professorId: Id,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return this.ormRepo.count({
      where: {
        professorId: professorId.value,
        status: ReservationStatus.RESERVED,
        date: Between(startDate, endDate),
      },
    });
  }

  /** @inheritdoc */
  public async save(reservation: RoomReservation): Promise<void> {
    const persistenceData = this.toPersistence(reservation);
    await this.ormRepo.save(persistenceData);
  }

  /** @inheritdoc */
  public async delete(id: Id): Promise<void> {
    await this.ormRepo.delete({ id: id.value });
  }
}
