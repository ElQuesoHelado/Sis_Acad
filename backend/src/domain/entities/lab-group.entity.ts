/**
 * @file Defines the LabGroup entity, representing a specific lab section using GroupLetter VO.
 */

import { z } from "zod";
import { Entity } from "./base/entity.base.js";
import { Id, GroupLetter } from "../value-objects/index.js";
import {
  DomainError,
  LabGroupCreationError,
  LabGroupFullError,
} from "../errors/index.js";

/** Zod schema for capacity (positive integer, max 50 for safety). */
const CapacitySchema = z.number().int().positive().max(50);

/** Internal properties validated with Value Objects. */
interface LabGroupProps {
  id: Id;
  courseId: Id;
  professorId: Id;
  groupLetter: GroupLetter;
  capacity: number;
  currentEnrollment: number;
}

/** Raw properties for the factory (primitive types). */
export interface LabGroupCreateProps {
  id: string;
  courseId: string;
  professorId: string;
  groupLetter: string; // e.g., "A", "B", "C"
  capacity: number;
  currentEnrollment?: number; // optional, defaults to 0
}

/** Represents a lab group for a course, with a professor and defined capacity. */
export class LabGroup extends Entity {
  public readonly courseId: Id;
  public readonly professorId: Id;
  public readonly groupLetter: GroupLetter;
  public readonly capacity: number;
  private _currentEnrollment: number;

  /** Private constructor. Use `LabGroup.create()` instead. */
  private constructor(props: LabGroupProps) {
    super(props.id);
    this.courseId = props.courseId;
    this.professorId = props.professorId;
    this.groupLetter = props.groupLetter;
    this.capacity = props.capacity;
    this._currentEnrollment = props.currentEnrollment;
  }

  /**
   * Factory method to create a new LabGroup instance.
   * @param props - Raw, unvalidated properties.
   * @returns A validated `LabGroup` instance.
   * @throws {DomainError} If any validation fails.
   */
  public static create(props: LabGroupCreateProps): LabGroup {
    try {
      const idVO = Id.create(props.id);
      const courseIdVO = Id.create(props.courseId);
      const professorIdVO = Id.create(props.professorId);
      const groupLetterVO = GroupLetter.create(props.groupLetter);

      const capacityValidation = CapacitySchema.safeParse(props.capacity);
      if (!capacityValidation.success) {
        throw new LabGroupCreationError(new Error("Invalid capacity."));
      }

      const currentEnrollment = props.currentEnrollment ?? 0;
      if (
        currentEnrollment < 0 ||
        currentEnrollment > capacityValidation.data
      ) {
        throw new LabGroupCreationError(
          new Error(
            "Current enrollment cannot be negative or exceed capacity.",
          ),
        );
      }

      return new LabGroup({
        id: idVO,
        courseId: courseIdVO,
        professorId: professorIdVO,
        groupLetter: groupLetterVO,
        capacity: capacityValidation.data,
        currentEnrollment,
      });
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new LabGroupCreationError(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /** Returns the current number of enrolled students. */
  public get currentEnrollment(): number {
    return this._currentEnrollment;
  }

  /** Returns true if the lab group is full. */
  public isFull(): boolean {
    return this._currentEnrollment >= this.capacity;
  }

  /** Increments the enrollment count. Throws if full. */
  public incrementEnrollment(): void {
    if (this.isFull()) {
      throw new LabGroupFullError();
    }
    this._currentEnrollment++;
  }

  /** Decrements the enrollment count. */
  public decrementEnrollment(): void {
    if (this._currentEnrollment > 0) {
      this._currentEnrollment--;
    }
  }

  /** Returns a human-readable display name, e.g., "Grupo A". */
  public getDisplayName(): string {
    return `Grupo ${this.groupLetter.value}`;
  }
}
