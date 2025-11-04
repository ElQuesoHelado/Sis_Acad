/**
 * @file Defines the RoomReservation entity (one-time classroom/lab reservation).
 */
import { Entity } from "./base/entity.base.js";
import { Id, TimeSlot, AcademicSemester } from "../value-objects/index.js";
import { ReservationStatus } from "../enums/index.js";
import { DomainError } from "../errors/base/error.base.js";
import {
  ReservationCreationError,
  InvalidReservationStatusError,
} from "../errors/room-reservation.errors.js";
import type { TimeSlotCreateProps } from "../value-objects/time-slot.vo.js";

/** Properties required to create a RoomReservation */
export interface RoomReservationCreateProps {
  id: string;
  classroomId: string; // Classroom (Theory or Lab)
  professorId: string; // User (Professor)
  semester: string; // Academic semester
  timeSlot: TimeSlotCreateProps; // Time block
  status: ReservationStatus;
}

interface RoomReservationProps {
  id: Id;
  classroomId: Id;
  professorId: Id;
  semester: AcademicSemester;
  timeSlot: TimeSlot;
  status: ReservationStatus;
}

/**
 * Represents a one-time reservation of a classroom (Classroom)
 * made by a professor for a specific TimeSlot in a semester.
 * @extends Entity
 */
export class RoomReservation extends Entity {
  public readonly classroomId: Id;
  public readonly professorId: Id;
  public readonly semester: AcademicSemester;
  public readonly timeSlot: TimeSlot;
  public status: ReservationStatus;

  private constructor(props: RoomReservationProps) {
    super(props.id);
    this.classroomId = props.classroomId;
    this.professorId = props.professorId;
    this.semester = props.semester;
    this.timeSlot = props.timeSlot;
    this.status = props.status;
  }

  /**
   * Factory method to create a new RoomReservation.
   * @param props - Properties required to create a reservation.
   * @throws `InvalidReservationStatusError` if the status is invalid.
   * @throws `ReservationCreationError` if any unexpected error occurs.
   */
  public static create(props: RoomReservationCreateProps): RoomReservation {
    try {
      if (!Object.values(ReservationStatus).includes(props.status)) {
        throw new InvalidReservationStatusError(props.status);
      }

      return new RoomReservation({
        id: Id.create(props.id),
        classroomId: Id.create(props.classroomId),
        professorId: Id.create(props.professorId),
        semester: AcademicSemester.create(props.semester),
        timeSlot: TimeSlot.create(props.timeSlot),
        status: props.status,
      });
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new ReservationCreationError(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Cancels the reservation (marks it as FREE).
   */
  public cancel(): void {
    this.status = ReservationStatus.FREE;
  }

  /**
   * Confirms the reservation (marks it as RESERVED).
   */
  public confirm(): void {
    this.status = ReservationStatus.RESERVED;
  }

  /**
   * Checks if this reservation overlaps with a proposed TimeSlot.
   * @param otherTimeSlot - The TimeSlot to check.
   * @returns `true` if there is an overlap.
   */
  public overlapsWith(otherTimeSlot: TimeSlot): boolean {
    // Only overlaps if the reservation is active and the slots intersect
    return (
      this.status === ReservationStatus.RESERVED &&
      this.timeSlot.overlapsWith(otherTimeSlot)
    );
  }
}
