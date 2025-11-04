/**
 * @file Defines the TimeOfDay Value Object.
 */

import { z } from "zod";
import { InvalidTimeFormatError } from "../errors/validation.errors.js";

/** Zod schema for validating a 24-hour time string (HH:MM). */
const TimeSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/);

/**
 * Value Object representing a validated time of day (HH:MM).
 */
export class TimeOfDay {
  /** The validated time string (HH:MM). */
  public readonly value: string;

  private readonly hour: number;
  private readonly minute: number;

  /** Private constructor. Use `TimeOfDay.create()` instead. */
  private constructor(time: string) {
    this.value = time;

    const parts = time.split(":");
    this.hour = Number(parts[0]!);
    this.minute = Number(parts[1]!);
  }

  /**
   * Validates and creates a new TimeOfDay instance.
   * @param time - The raw, untrusted time string (e.g., "10:00").
   * @returns A new `TimeOfDay` instance.
   * @throws Error if the time is invalid.
   */
  public static create(time: string): TimeOfDay {
    const result = TimeSchema.safeParse(time);

    if (!result.success) {
      throw new InvalidTimeFormatError(result.error.issues[0]?.message);
    }

    return new TimeOfDay(result.data);
  }

  /**
   * Checks if this time is before another.
   * @param other - The time to compare against.
   * @returns `true` if this time is before the other time.
   */
  public isBefore(other: TimeOfDay): boolean {
    if (this.hour < other.hour) return true;
    if (this.hour > other.hour) return false;
    return this.minute < other.minute;
  }

  /**
   * Checks if this time is after another.
   * @param other - The time to compare against.
   * @returns `true` if this time is after the other time.
   */
  public isAfter(other: TimeOfDay): boolean {
    return !this.isBefore(other) && !this.equals(other);
  }

  /**
   * Checks equality with another TimeOfDay instance.
   * @param other - The other instance to compare.
   * @returns `true` if both times are equal.
   */
  public equals(other: TimeOfDay): boolean {
    return this.value === other.value;
  }

  /**
   * Returns the primitive string value.
   * @returns The time string (HH:MM).
   */
  public toString(): string {
    return this.value;
  }
}
