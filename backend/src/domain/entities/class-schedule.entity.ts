/**
 * @file Defines the ClassSchedule entity (fixed schedule for a semester).
 */

import { Entity } from "./base/entity.base.js";
import { Id, TimeSlot, AcademicSemester } from "../value-objects/index.js";
import {
  DomainError,
  ClassScheduleCreationError,
  ScheduleConflictError,
  ScheduleAssignmentError,
} from "../errors/index.js";
import type { TimeSlotCreateProps } from "../value-objects/time-slot.vo.js";

/** Internal validated properties for ClassSchedule constructor */
interface ClassScheduleProps {
  id: Id;
  classroomId: Id;
  timeSlot: TimeSlot;
  semester: AcademicSemester;
  courseId: Id | null;
  labGroupId: Id | null;
}

/** Raw properties for factory creation */
export interface ClassScheduleCreateProps {
  id: string;
  classroomId: string;
  timeSlot: TimeSlotCreateProps;
  semester: string;
  courseId?: string | null;
  labGroupId?: string | null;
}

/**
 * Represents a fixed class schedule: assignment of a classroom
 * and time slot for a course or lab group in a semester.
 * @extends Entity
 */
export class ClassSchedule extends Entity {
  public readonly classroomId: Id;
  public readonly timeSlot: TimeSlot;
  public readonly semester: AcademicSemester;
  public readonly courseId: Id | null;
  public readonly labGroupId: Id | null;

  /** Private constructor. Use `ClassSchedule.create()` instead. */
  private constructor(props: ClassScheduleProps) {
    super(props.id);
    this.classroomId = props.classroomId;
    this.timeSlot = props.timeSlot;
    this.semester = props.semester;
    this.courseId = props.courseId;
    this.labGroupId = props.labGroupId;
  }

  /**
   * Factory method to create a new ClassSchedule instance.
   * @param props - Raw primitive properties.
   * @returns A validated `ClassSchedule` instance.
   * @throws {DomainError} If validation fails.
   */
  public static create(props: ClassScheduleCreateProps): ClassSchedule {
    try {
      const idVO = Id.create(props.id);
      const classroomIdVO = Id.create(props.classroomId);
      const timeSlotVO = TimeSlot.create(props.timeSlot);
      const semesterVO = AcademicSemester.create(props.semester);

      const courseIdVO = props.courseId ? Id.create(props.courseId) : null;
      const labGroupIdVO = props.labGroupId
        ? Id.create(props.labGroupId)
        : null;

      // A schedule must belong to either a course OR a lab group, not both
      if (courseIdVO && labGroupIdVO) {
        throw new ScheduleConflictError();
      }

      // A schedule must belong to at least one
      if (!courseIdVO && !labGroupIdVO) {
        throw new ScheduleAssignmentError();
      }

      return new ClassSchedule({
        id: idVO,
        classroomId: classroomIdVO,
        timeSlot: timeSlotVO,
        semester: semesterVO,
        courseId: courseIdVO,
        labGroupId: labGroupIdVO,
      });
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new ClassScheduleCreationError(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Checks if this schedule's TimeSlot overlaps with another.
   * Useful for reservation validations.
   * @param otherTimeSlot - The TimeSlot to compare against.
   * @returns `true` if there is an overlap, `false` otherwise.
   */
  public overlapsWith(otherTimeSlot: TimeSlot): boolean {
    return this.timeSlot.overlapsWith(otherTimeSlot);
  }
}
