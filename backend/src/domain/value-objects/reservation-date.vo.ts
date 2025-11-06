/**
 * @file Defines the ReservationDate Value Object (YYYY-MM-DD).
 */
import { z } from "zod";
import {
  InvalidReservationDateError,
  ReservationWindowError,
} from "../errors/validation.errors.js";

const MAX_RESERVATION_WINDOW_DAYS = 14;

/** Zod schema for validating a YYYY-MM-DD date string. */
const DateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be a valid YYYY-MM-DD string.");

/**
 * Gets the current date, normalized to midnight UTC.
 */
function getTodayNormalized(): Date {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0); // Normalize to start of day UTC
  return today;
}

/**
 * Value Object representing a validated reservation date, normalized to UTC.
 */
export class ReservationDate {
  /** The normalized Date object (at UTC midnight). */
  public readonly value: Date;
  /** The original validated ISO date string (YYYY-MM-DD). */
  public readonly isoString: string;

  /** Private constructor. Use `ReservationDate.create()` instead. */
  private constructor(date: Date, isoString: string) {
    this.value = date;
    this.isoString = isoString;
  }

  /**
   * Validates a YYYY-MM-DD string and creates a new ReservationDate instance.
   * @param dateString - The raw, untrusted date string (e.g., "2025-11-20").
   * @returns A new `ReservationDate` instance.
   * @throws `InvalidReservationDateError` if the string is invalid.
   * @throws `ReservationWindowError` if the date is outside the allowed window.
   */
  public static create(dateString: string): ReservationDate {
    const stringResult = DateStringSchema.safeParse(dateString);
    if (!stringResult.success) {
      throw new InvalidReservationDateError(stringResult.error.message);
    }

    const date = new Date(`${dateString}T00:00:00Z`); // Treat as UTC
    if (isNaN(date.getTime())) {
      throw new InvalidReservationDateError(
        `Invalid date: '${dateString}' is not a real date.`,
      );
    }

    // Check date parts match (e.g., 2025-02-30 is invalid)
    const [year, month, day] = dateString.split("-").map(Number);
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() + 1 !== month ||
      date.getUTCDate() !== day
    ) {
      throw new InvalidReservationDateError(
        `Invalid date components: '${dateString}' is not a real date.`,
      );
    }

    const today = getTodayNormalized();
    const maxDate = new Date(today.getTime());
    maxDate.setUTCDate(today.getUTCDate() + MAX_RESERVATION_WINDOW_DAYS);

    if (date < today) {
      throw new ReservationWindowError(
        "Cannot create reservations in the past.",
      );
    }
    if (date > maxDate) {
      throw new ReservationWindowError(
        `Reservations can only be made up to ${MAX_RESERVATION_WINDOW_DAYS} days in advance.`,
      );
    }

    return new ReservationDate(date, dateString);
  }

  /**
   * Checks equality with another ReservationDate instance.
   * @param other - The other instance to compare.
   * @returns `true` if both dates are equal.
   */
  public equals(other: ReservationDate): boolean {
    return this.value.getTime() === other.value.getTime();
  }

  /**
   * Returns the normalized Date object.
   */
  public toDate(): Date {
    return this.value;
  }

  /**
   * Returns the ISO string (YYYY-MM-DD).
   */
  public toString(): string {
    return this.isoString;
  }
}
