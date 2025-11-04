/**
 * @file Defines the Percentage Value Object.
 */

import { z } from "zod";
import { InvalidPercentageError } from "@/domain/errors/index.js";

/** Zod schema for validating a percentage (0-100). */
const PercentageSchema = z.number().min(0).max(100);

/** Value Object representing a validated percentage (0-100). */
export class Percentage {
  /** Validated percentage value. */
  public readonly value: number;

  /** Private constructor. Use `Percentage.create()` instead. */
  private constructor(value: number) {
    this.value = value;
  }

  /**
   * Validates and creates a new Percentage instance.
   * @param value - Raw, untrusted percentage number.
   * @returns A new `Percentage` instance.
   * @throws `InvalidPercentageError` if the value is not between 0 and 100.
   */
  public static create(value: number): Percentage {
    const result = PercentageSchema.safeParse(value);

    if (!result.success) {
      throw new InvalidPercentageError(result.error.issues[0]?.message);
    }

    return new Percentage(result.data);
  }

  /**
   * Compares this Percentage instance with another.
   * @param other - Another `Percentage` instance.
   * @returns `true` if both values are identical.
   */
  public equals(other: Percentage): boolean {
    return this.value === other.value;
  }

  /**
   * Returns the primitive string value.
   * @returns The percentage as a string.
   */
  public toString(): string {
    return this.value.toString();
  }
}
