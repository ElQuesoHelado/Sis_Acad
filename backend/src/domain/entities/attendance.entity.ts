/**
 * @file Defines the Attendance entity (student attendance record).
 */

import { Entity } from "./base/entity.base.js";
import { Id } from "../value-objects/index.js";
import { AttendanceStatus, ClassType } from "../enums/index.js";
import { DomainError } from "../errors/base/error.base.js";
import {
  AttendanceCreationError,
  InvalidAttendanceStatusError,
  FutureAttendanceDateError,
  InvalidClassTypeError,
} from "../errors/attendance.errors.js";

/**
 * Properties needed to create a new Attendance entity.
 */
export interface AttendanceCreateProps {
  id: string;
  enrollmentId: string; // The Enrollment ID
  date: Date; // The date of attendance
  status: AttendanceStatus;
  classType: ClassType; // Indicates if it's a Theory or Lab class
}

interface AttendanceProps {
  id: Id;
  enrollmentId: Id;
  date: Date;
  status: AttendanceStatus;
  classType: ClassType;
}

/**
 * Represents an attendance record (present/absent) for a
 * student enrolled in a course on a specific date and class type.
 * @extends Entity
 */
export class Attendance extends Entity {
  public readonly enrollmentId: Id;
  public readonly date: Date;
  public status: AttendanceStatus;
  public readonly classType: ClassType;

  private constructor(props: AttendanceProps) {
    super(props.id);
    this.enrollmentId = props.enrollmentId;
    this.date = props.date;
    this.status = props.status;
    this.classType = props.classType;
  }

  /**
   * Factory method to create a new Attendance entity with validation.
   * @param props - The properties to create the entity.
   * @returns A new Attendance instance.
   * @throws Domain errors if validation fails.
   */
  public static create(props: AttendanceCreateProps): Attendance {
    try {
      if (!Object.values(AttendanceStatus).includes(props.status)) {
        throw new InvalidAttendanceStatusError(props.status);
      }
      if (!Object.values(ClassType).includes(props.classType)) {
        throw new InvalidClassTypeError(props.classType);
      }

      const attendanceDate = new Date(
        Date.UTC(
          props.date.getFullYear(),
          props.date.getMonth(),
          props.date.getDate(),
        ),
      );

      const today = new Date();
      const todayUTC = new Date(
        Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
      );

      if (attendanceDate.getTime() > todayUTC.getTime()) {
        throw new FutureAttendanceDateError();
      }

      return new Attendance({
        id: Id.create(props.id),
        enrollmentId: Id.create(props.enrollmentId),
        date: attendanceDate,
        status: props.status,
        classType: props.classType,
      });
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new AttendanceCreationError(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Allows the teacher to update/correct the attendance status.
   * @param newStatus - The new attendance status (Present or Absent).
   * @throws InvalidAttendanceStatusError if the new status is invalid.
   */
  public updateStatus(newStatus: AttendanceStatus): void {
    if (!Object.values(AttendanceStatus).includes(newStatus)) {
      throw new InvalidAttendanceStatusError(newStatus);
    }
    this.status = newStatus;
  }
}
