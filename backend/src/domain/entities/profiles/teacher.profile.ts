/**
 * @file Defines the TeacherProfile entity, linking a User to their specialization.
 */

import { z } from "zod";
import { Entity } from "../base/entity.base.js";
import { Id } from "../../value-objects/index.js";
import {
  DomainError,
  TeacherProfileCreationError,
} from "../../errors/index.js";

// Internal validation schema for specialization
const SpecializationSchema = z.string().trim().min(3).max(150);

/** Validated internal properties */
interface TeacherProfileProps {
  id: Id;
  userId: Id;
  specialization: string;
}

/** Raw properties for the factory (primitive values) */
export interface TeacherProfileCreateProps {
  id: string; // UUID
  userId: string; // UUID of the User
  specialization: string;
}

/**
 * Represents a Teacher's profile, linking a User entity
 * with their professional specialization.
 * @extends Entity
 */
export class TeacherProfile extends Entity {
  public readonly userId: Id;
  public readonly specialization: string;

  /**
   * Private constructor. Use `TeacherProfile.create()` to instantiate.
   * @param props - Validated properties.
   */
  private constructor(props: TeacherProfileProps) {
    super(props.id);
    this.userId = props.userId;
    this.specialization = props.specialization;
  }

  /**
   * Factory method to create a new TeacherProfile entity.
   * Validates primitive inputs and creates Value Objects internally.
   * @param props - Raw properties (primitives).
   * @returns A new validated `TeacherProfile` instance.
   * @throws {DomainError} If validation fails.
   */
  public static create(props: TeacherProfileCreateProps): TeacherProfile {
    try {
      const idVO = Id.create(props.id);
      const userIdVO = Id.create(props.userId);

      const specializationValidation = SpecializationSchema.safeParse(
        props.specialization,
      );
      if (!specializationValidation.success) {
        throw new TeacherProfileCreationError(
          new Error(
            `Invalid specialization: ${specializationValidation.error.message}`,
          ),
        );
      }

      return new TeacherProfile({
        id: idVO,
        userId: userIdVO,
        specialization: specializationValidation.data,
      });
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new TeacherProfileCreationError(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}
