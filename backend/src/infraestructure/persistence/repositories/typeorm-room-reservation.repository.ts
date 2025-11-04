/**
 * @file TypeORM implementation of the RoomReservation repository.
 */

import { type Repository, LessThan, MoreThan, EntityManager } from "typeorm";
import { RoomReservation } from "@/domain/entities/room-reservation.entity.js";
import { type IRoomReservationRepository } from "@/domain/repositories/iroom-reservation.repository.js";
import { RoomReservationModel } from "../models/room-reservation.model.js";
import type {
  Id,
  AcademicSemester,
  TimeSlot,
} from "@/domain/value-objects/index.js";
import { ReservationStatus } from "@/domain/enums/index.js";
import { AppDataSource } from "../database.config.js";

/**
 * Repository implementation for RoomReservation using TypeORM.
 */
export class TypeormRoomReservationRepository
  implements IRoomReservationRepository
{
  private ormRepo: Repository<RoomReservationModel>;

  constructor(manager?: EntityManager) {
    const repository = manager ?? AppDataSource;
    this.ormRepo = repository.getRepository(RoomReservationModel);
  }

  /**
   * Maps a TypeORM RoomReservationModel to a domain RoomReservation entity.
   * Value objects (semester, startTime, endTime) are handled by the model transformers.
   * @param model - The database model.
   * @returns The domain entity.
   */
  private toDomain = (model: RoomReservationModel): RoomReservation => {
    return RoomReservation.create({
      id: model.id,
      classroomId: model.classroomId,
      professorId: model.professorId,
      semester: model.semester.value,
      status: model.status,
      timeSlot: {
        day: model.day,
        startTime: model.startTime.value,
        endTime: model.endTime.value,
      },
    });
  };

  /**
   * Maps a domain RoomReservation entity to a plain object for persistence.
   * Value objects are passed directly; model transformers handle them.
   * @param entity - The domain entity.
   * @returns A plain object suitable for TypeORM.
   */
  private toPersistence(entity: RoomReservation) {
    return {
      id: entity.id.value,
      classroomId: entity.classroomId.value,
      professorId: entity.professorId.value,
      semester: entity.semester,
      status: entity.status,
      day: entity.timeSlot.day,
      startTime: entity.timeSlot.startTime,
      endTime: entity.timeSlot.endTime,
    };
  }

  /** Finds a RoomReservation by its ID. */
  public async findById(id: Id): Promise<RoomReservation | null> {
    const model = await this.ormRepo.findOneBy({ id: id.value });
    return model ? this.toDomain(model) : null;
  }

  /** Finds all reservations for a professor in a specific semester. */
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

  /** Finds all reservations for a classroom in a specific semester. */
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

  /**
   * Finds active reservations that overlap a given time slot in a classroom.
   * Only considers reservations with status "RESERVED".
   */
  public async findOverlappingReservations(
    classroomId: Id,
    semester: AcademicSemester,
    timeSlot: TimeSlot,
  ): Promise<RoomReservation[]> {
    const models = await this.ormRepo.find({
      where: {
        classroomId: classroomId.value,
        semester: semester,
        day: timeSlot.day,
        status: ReservationStatus.RESERVED,
        startTime: LessThan(timeSlot.endTime.value),
        endTime: MoreThan(timeSlot.startTime.value),
      },
    });
    return models.map(this.toDomain);
  }

  /** Saves (creates or updates) a RoomReservation. */
  public async save(reservation: RoomReservation): Promise<void> {
    const persistenceData = this.toPersistence(reservation);
    await this.ormRepo.save(persistenceData);
  }

  /** Deletes a RoomReservation by its ID. */
  public async delete(id: Id): Promise<void> {
    await this.ormRepo.delete({ id: id.value });
  }
}
