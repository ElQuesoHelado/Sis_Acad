/**
 * @file Defines the TimeSlot Value Object.
 */

import { DayOfWeek } from "../enums/day-of-week.enum.js";
import {
  InvalidDayOfWeekError,
  InvalidTimeSlotError,
} from "../errors/validation.errors.js";
import { TimeOfDay } from "./time-of-day.vo.js";

/** Properties required for the private constructor. */
export interface TimeSlotProps {
  day: DayOfWeek;
  startTime: TimeOfDay;
  endTime: TimeOfDay;
}

/** Raw properties provided to the factory method. Time inputs are strings pending validation. */
export interface TimeSlotCreateProps {
  day: DayOfWeek;
  startTime: string; // e.g., "10:00"
  endTime: string; // e.g., "12:00"
}

/**
 * Value Object representing a validated block of time (e.g., LUNES 10:00-12:00).
 */
export class TimeSlot {
  public readonly day: DayOfWeek;
  public readonly startTime: TimeOfDay;
  public readonly endTime: TimeOfDay;

  /** Private constructor. Use `TimeSlot.create()` instead. */
  private constructor(props: TimeSlotProps) {
    this.day = props.day;
    this.startTime = props.startTime;
    this.endTime = props.endTime;
  }

  /**
   * Validates input and creates a new TimeSlot instance.
   * @param props - Raw, untrusted properties.
   * @returns A new `TimeSlot` instance.
   * @throws Error if validation fails (invalid times or day).
   */
  public static create(props: TimeSlotCreateProps): TimeSlot {
    const startTimeVO = TimeOfDay.create(props.startTime);
    const endTimeVO = TimeOfDay.create(props.endTime);

    if (startTimeVO.isAfter(endTimeVO) || startTimeVO.equals(endTimeVO)) {
      throw new InvalidTimeSlotError("End time must be after start time.");
    }

    if (!props.day || !Object.values(DayOfWeek).includes(props.day)) {
      throw new InvalidDayOfWeekError("Invalid day of the week.");
    }

    return new TimeSlot({
      day: props.day,
      startTime: startTimeVO,
      endTime: endTimeVO,
    });
  }

  /**
   * Checks if this time slot overlaps with another.
   * @param other - The other time slot to check against.
   * @returns `true` if the slots overlap, `false` otherwise.
   */
  public overlapsWith(other: TimeSlot): boolean {
    if (this.day !== other.day) return false;

    return (
      this.startTime.isBefore(other.endTime) &&
      this.endTime.isAfter(other.startTime)
    );
  }

  /**
   * Returns a human-readable string representation.
   * @returns e.g., "LUNES: 10:00-12:00".
   */
  public toString(): string {
    return `${this.day}: ${this.startTime.toString()}-${this.endTime.toString()}`;
  }
}
