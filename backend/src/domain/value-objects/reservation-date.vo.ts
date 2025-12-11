import { z } from "zod";
import { InvalidReservationDateError } from "../errors/validation.errors.js";

/** Zod schema for validating a YYYY-MM-DD date string. */
const DateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be a valid YYYY-MM-DD string.");

/**
 * Value Object representing a validated reservation date, normalized to UTC.
 */
export class ReservationDate {
  public readonly value: Date;
  public readonly isoString: string;

  private constructor(date: Date, isoString: string) {
    this.value = date;
    this.isoString = isoString;
  }

  public static create(dateString: string): ReservationDate {
    const stringResult = DateStringSchema.safeParse(dateString);
    if (!stringResult.success) {
      throw new InvalidReservationDateError(stringResult.error.message);
    }

    const date = new Date(`${dateString}T00:00:00Z`);
    if (isNaN(date.getTime())) {
      throw new InvalidReservationDateError(
        `Invalid date: '${dateString}' is not a real date.`,
      );
    }

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
    return new ReservationDate(date, dateString);
  }

  public equals(other: ReservationDate): boolean {
    return this.value.getTime() === other.value.getTime();
  }

  public toDate(): Date {
    return this.value;
  }

  public toString(): string {
    return this.isoString;
  }
}
