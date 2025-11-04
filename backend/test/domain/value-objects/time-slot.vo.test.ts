import { describe, it, expect } from "vitest";
import {
  TimeSlot,
  type TimeSlotCreateProps,
} from "@/domain/value-objects/time-slot.vo.js";
import { DayOfWeek } from "@/domain/enums/day-of-week.enum.js";
import {
  InvalidDayOfWeekError,
  InvalidTimeFormatError,
  InvalidTimeSlotError,
} from "@/domain/errors/validation.errors.js";

describe("Domain > Value Object: TimeSlot", () => {
  const baseProps: TimeSlotCreateProps = {
    day: DayOfWeek.MONDAY,
    startTime: "10:00",
    endTime: "12:00",
  };

  it("should create a valid TimeSlot instance", () => {
    const slot = TimeSlot.create(baseProps);
    expect(slot).toBeInstanceOf(TimeSlot);
    expect(slot.day).toBe(DayOfWeek.MONDAY);
  });

  it("should throw InvalidTimeSlotError if endTime is before startTime", () => {
    const invalidProps = { ...baseProps, startTime: "14:00", endTime: "12:00" };
    expect(() => TimeSlot.create(invalidProps)).toThrow(InvalidTimeSlotError);
  });

  it("should throw InvalidTimeSlotError if endTime is equal to startTime", () => {
    const invalidProps = { ...baseProps, startTime: "12:00", endTime: "12:00" };
    expect(() => TimeSlot.create(invalidProps)).toThrow(InvalidTimeSlotError);
  });

  it("should throw InvalidDayOfWeekError if day is invalid", () => {
    const invalidProps = { ...baseProps, day: "DOMINGO-MAL" as any };
    expect(() => TimeSlot.create(invalidProps)).toThrow(InvalidDayOfWeekError);
  });

  it("should throw InvalidTimeFormatError if startTime is invalid", () => {
    const invalidProps = { ...baseProps, startTime: "99:00" };
    expect(() => TimeSlot.create(invalidProps)).toThrow(InvalidTimeFormatError);
  });

  it("should throw InvalidTimeFormatError endTime is invalid", () => {
    const invalidProps = { ...baseProps, endTime: "25:00" };
    expect(() => TimeSlot.create(invalidProps)).toThrow(InvalidTimeFormatError);
  });

  it("should return a human-readable string", () => {
    const slot = TimeSlot.create(baseProps);
    expect(slot.toString()).toBe("LUNES: 10:00-12:00");
  });

  describe("Overlap Detection (overlapsWith)", () => {
    const mainSlot = TimeSlot.create({
      day: DayOfWeek.MONDAY,
      startTime: "10:00",
      endTime: "12:00",
    });

    it("should NOT overlap if on a different day", () => {
      const otherDaySlot = TimeSlot.create({
        day: DayOfWeek.TUESDAY,
        startTime: "10:00",
        endTime: "12:00",
      });
      expect(mainSlot.overlapsWith(otherDaySlot)).toBe(false);
    });

    it("should overlap with an identical slot", () => {
      const identicalSlot = TimeSlot.create({
        day: DayOfWeek.MONDAY,
        startTime: "10:00",
        endTime: "12:00",
      });
      expect(mainSlot.overlapsWith(identicalSlot)).toBe(true);
    });

    it("should overlap if one slot is fully contained within another", () => {
      const innerSlot = TimeSlot.create({
        day: DayOfWeek.MONDAY,
        startTime: "10:30",
        endTime: "11:30",
      });
      expect(mainSlot.overlapsWith(innerSlot)).toBe(true);
      expect(innerSlot.overlapsWith(mainSlot)).toBe(true);
    });

    it("should overlap if the start time overlaps", () => {
      const startOverlapSlot = TimeSlot.create({
        day: DayOfWeek.MONDAY,
        startTime: "09:00",
        endTime: "11:00",
      });
      expect(mainSlot.overlapsWith(startOverlapSlot)).toBe(true);
    });

    it("should overlap if the end time overlaps", () => {
      const endOverlapSlot = TimeSlot.create({
        day: DayOfWeek.MONDAY,
        startTime: "11:00",
        endTime: "13:00",
      });
      expect(mainSlot.overlapsWith(endOverlapSlot)).toBe(true);
    });

    it("should NOT overlap if they are adjacent (touching)", () => {
      const adjacentStartSlot = TimeSlot.create({
        day: DayOfWeek.MONDAY,
        startTime: "08:00",
        endTime: "10:00",
      });
      const adjacentEndSlot = TimeSlot.create({
        day: DayOfWeek.MONDAY,
        startTime: "12:00",
        endTime: "14:00",
      });

      expect(mainSlot.overlapsWith(adjacentStartSlot)).toBe(false);
      expect(mainSlot.overlapsWith(adjacentEndSlot)).toBe(false);
    });
  });
});
