/**
 * @file Defines the RoomReservation entity (one-time classroom/lab reservation).
 */
import { Entity } from "./base/entity.base.js";
import {
  Id,
  TimeOfDay,
  AcademicSemester,
  ReservationDate,
} from "../value-objects/index.js";
import { ReservationStatus } from "../enums/index.js";
import { DomainError } from "../errors/base/error.base.js";
import {
  ReservationCreationError,
  InvalidReservationStatusError,
  InvalidReservationTimeError,
  CompletedReservationError,
} from "../errors/room-reservation.errors.js";
import { InvalidReservationDateError } from "../errors/validation.errors.js";

/**
 * Properties required to create a RoomReservation.
 * This interface is used by the factory method and accepts primitives.
 */
export interface RoomReservationCreateProps {
  id: string;
  classroomId: string;
  professorId: string;
  semester: string;
  date: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  notes?: string;
}

/**
 * Internal validated properties of the entity.
 */
interface RoomReservationProps {
  id: Id;
  classroomId: Id;
  professorId: Id;
  semester: AcademicSemester;
  date: ReservationDate;
  startTime: TimeOfDay;
  endTime: TimeOfDay;
  status: ReservationStatus;
  notes?: string;
}

/**
 * Represents a one-time reservation of a classroom (Classroom)
 * made by a professor for a specific date and time block in a semester.
 * @extends Entity
 */
export class RoomReservation extends Entity {
  public readonly classroomId: Id;
  public readonly professorId: Id;
  public readonly semester: AcademicSemester;
  public readonly date: ReservationDate;
  public readonly startTime: TimeOfDay;
  public readonly endTime: TimeOfDay;
  public status: ReservationStatus;
  public notes?: string;

  /**
   * Private constructor. Use `RoomReservation.create()` instead.
   * @param props - Validated properties.
   */
  private constructor(props: RoomReservationProps) {
    super(props.id);
    this.classroomId = props.classroomId;
    this.professorId = props.professorId;
    this.semester = props.semester;
    this.date = props.date;
    this.startTime = props.startTime;
    this.endTime = props.endTime;
    this.status = props.status;
    this.notes = props.notes;
  }

  /**
   * Factory method to create a new RoomReservation.
   * @param props - Properties (primitives) required to create a reservation.
   * @throws {InvalidReservationStatusError} if the status is invalid.
   * @throws {InvalidReservationTimeError} if endTime is not after startTime.
   * @throws {ReservationCreationError} if any other unexpected error occurs.
   */
  public static create(props: RoomReservationCreateProps): RoomReservation {
    try {
      if (!Object.values(ReservationStatus).includes(props.status)) {
        throw new InvalidReservationStatusError(props.status);
      }

      const idVO = Id.create(props.id);
      const classroomIdVO = Id.create(props.classroomId);
      const professorIdVO = Id.create(props.professorId);
      const semesterVO = AcademicSemester.create(props.semester);
      const startTimeVO = TimeOfDay.create(props.startTime);
      const endTimeVO = TimeOfDay.create(props.endTime);

      const dateVO = ReservationDate.create(props.date);

      if (startTimeVO.isAfter(endTimeVO) || startTimeVO.equals(endTimeVO)) {
        throw new InvalidReservationTimeError();
      }

      return new RoomReservation({
        id: idVO,
        classroomId: classroomIdVO,
        professorId: professorIdVO,
        semester: semesterVO,
        date: dateVO,
        startTime: startTimeVO,
        endTime: endTimeVO,
        status: props.status,
        notes: props.notes,
      });
    } catch (error) {
      if (
        error instanceof DomainError ||
        error instanceof InvalidReservationDateError
      ) {
        throw error;
      }
      throw new ReservationCreationError(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Cancels the reservation (marks it as FREE).
   * @throws {CompletedReservationError} if the reservation is already completed.
   */
  public cancel(): void {
    if (this.status === ReservationStatus.COMPLETED) {
      throw new CompletedReservationError("cancel");
    }
    this.status = ReservationStatus.FREE;
  }

  /**
   * Marks the reservation as completed (after the time has passed).
   */
  public markAsCompleted(): void {
    this.status = ReservationStatus.COMPLETED;
  }

  /**
   * Checks if this reservation overlaps with a proposed date/time block.
   * Used for conflict detection.
   * @param otherDate - The date to check against.
   * @param otherStartTime - The start time to check against.
   * @param otherEndTime - The end time to check against.
   * @returns `true` if there is an overlap, `false` otherwise.
   */
  public overlapsWith(
    otherDate: Date,
    otherStartTime: TimeOfDay,
    otherEndTime: TimeOfDay,
  ): boolean {
    if (this.status !== ReservationStatus.RESERVED) return false;

    const otherDateStr = otherDate.toISOString().split("T")[0];
    if (this.date.isoString !== otherDateStr) return false;

    // Check time overlap: (A.start < B.end) && (A.end > B.start)
    return (
      this.startTime.isBefore(otherEndTime) &&
      this.endTime.isAfter(otherStartTime)
    );
  }
}
