/**
 * @file Defines the Score Value Object (0-20).
 */

import { z } from "zod";
import { InvalidScoreError } from "@/domain/errors/index.js";

/** Zod schema for validating a score (0-20, allows decimals). */
const ScoreSchema = z.number().min(0).max(20);

/**
 * Value Object representing a validated score between 0 and 20.
 */
export class Score {
  /** The validated numeric score value. */
  public readonly value: number;

  /** Private constructor. Use `Score.create()` to instantiate. */
  private constructor(value: number) {
    this.value = value;
  }

  /**
   * Validates and creates a new Score instance.
   * @param value - The numeric score (e.g., 15.5).
   * @returns A new `Score` instance.
   * @throws `InvalidScoreError` if the value is not between 0 and 20.
   */
  public static create(value: number): Score {
    const result = ScoreSchema.safeParse(value);

    if (!result.success) {
      throw new InvalidScoreError(result.error.issues[0]?.message);
    }

    return new Score(result.data);
  }

  /**
   * Compares this score with another Score VO.
   * @param other - Another `Score` value object.
   * @returns `true` if the score values are identical.
   */
  public equals(other: Score): boolean {
    return this.value === other.value;
  }

  /**
   * Returns the primitive value as a string.
   * @returns The score as a string.
   */
  public toString(): string {
    return this.value.toString();
  }
}
