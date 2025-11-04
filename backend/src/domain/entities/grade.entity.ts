/**
 * @file Defines the Grade entity.
 */
import { Entity } from "./base/entity.base.js";
import { Id, Score } from "../value-objects/index.js";
import { GradeType } from "../enums/index.js";
import { DomainError } from "../errors/base/error.base.js";
import {
  GradeCreationError,
  InvalidGradeTypeError,
} from "../errors/grade.errors.js";

/**
 * Properties required to create a Grade.
 */
export interface GradeCreateProps {
  id: string;
  enrollmentId: string;
  type: GradeType;
  score: number;
}

/**
 * Internal properties of a Grade entity.
 */
interface GradeProps {
  id: Id;
  enrollmentId: Id;
  type: GradeType;
  score: Score; // Usamos el VO Score (0-20)
}

/**
 * Represents a student's grade for a specific assessment
 * in a course they are enrolled in.
 * @extends Entity
 */
export class Grade extends Entity {
  /** ID of the associated enrollment */
  public readonly enrollmentId: Id;

  /** Type of the grade (e.g., partial, final) */
  public readonly type: GradeType;

  /** Score of the grade as a Score value object (0-20) */
  public score: Score;

  private constructor(props: GradeProps) {
    super(props.id);
    this.enrollmentId = props.enrollmentId;
    this.type = props.type;
    this.score = props.score;
  }

  /**
   * Factory method to create a Grade entity.
   * Validates the type and wraps errors in domain-specific exceptions.
   * @param props - Properties to create the Grade.
   * @throws {InvalidGradeTypeError} if the type is not part of GradeType enum.
   * @throws {InvalidScoreError} if the score is not between 0 and 20.
   * @throws {GradeCreationError} if an unexpected error occurs.
   * @returns A new Grade entity.
   */
  public static create(props: GradeCreateProps): Grade {
    try {
      if (!Object.values(GradeType).includes(props.type)) {
        throw new InvalidGradeTypeError(props.type);
      }

      // Validamos y creamos el VO Score (0-20)
      const scoreVO = Score.create(props.score);

      return new Grade({
        id: Id.create(props.id),
        enrollmentId: Id.create(props.enrollmentId),
        type: props.type,
        score: scoreVO,
      });
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new GradeCreationError(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Updates the score of the grade.
   * @param newScore - New score to set (0-20).
   * @throws {InvalidScoreError} if the new score is invalid.
   */
  public updateScore(newScore: number): void {
    this.score = Score.create(newScore);
  }
}
