/**
 * @file Defines the Classroom entity (a physical room).
 */

import { z } from "zod";
import { Entity } from "./base/entity.base.js";
import { Id } from "../value-objects/index.js";
import { ClassType } from "../enums/index.js";
import { DomainError, ClassroomCreationError } from "../errors/index.js";

const NameSchema = z.string().trim().min(3).max(50);
const CapacitySchema = z.number().int().positive().max(100); // Maximum capacity 100

/** Internal properties validated with Value Objects. */
interface ClassroomProps {
  id: Id;
  name: string; // e.g., "Room A-201", "Lab C-105"
  type: ClassType; // THEORY | LAB
  capacity: number;
}

/** Raw properties for the factory method `.create()`. */
export interface ClassroomCreateProps {
  id: string; // UUID
  name: string;
  type: ClassType;
  capacity: number;
}

/** Represents a physical classroom or lab where classes are held. */
export class Classroom extends Entity {
  public readonly name: string;
  public readonly type: ClassType;
  public readonly capacity: number;

  /** Private constructor. Use `Classroom.create()` instead. */
  private constructor(props: ClassroomProps) {
    super(props.id);
    this.name = props.name;
    this.type = props.type;
    this.capacity = props.capacity;
  }

  /**
   * Factory method to create a new Classroom instance.
   * @param props - Raw, unvalidated properties.
   * @returns A validated `Classroom` instance.
   * @throws {DomainError} If any validation fails.
   */
  public static create(props: ClassroomCreateProps): Classroom {
    try {
      const idVO = Id.create(props.id);

      const nameValidation = NameSchema.safeParse(props.name);
      if (!nameValidation.success) {
        throw new ClassroomCreationError(new Error("Invalid classroom name."));
      }

      if (!Object.values(ClassType).includes(props.type)) {
        throw new ClassroomCreationError(new Error("Invalid classroom type."));
      }

      const capacityValidation = CapacitySchema.safeParse(props.capacity);
      if (!capacityValidation.success) {
        throw new ClassroomCreationError(new Error("Invalid capacity."));
      }

      return new Classroom({
        id: idVO,
        name: nameValidation.data,
        type: props.type,
        capacity: capacityValidation.data,
      });
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new ClassroomCreationError(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}
