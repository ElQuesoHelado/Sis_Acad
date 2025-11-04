import { describe, it, expect } from "vitest";
import { TimeOfDay } from "@/domain/value-objects/time-of-day.vo.js";
import { InvalidTimeFormatError } from "@/domain/errors/validation.errors.js";

describe("Domain > Value Object: TimeOfDay", () => {
  it("should create a valid TimeOfDay instance", () => {
    const time = TimeOfDay.create("14:30");
    expect(time).toBeInstanceOf(TimeOfDay);
    expect(time.value).toBe("14:30");
  });

  it("should create a valid TimeOfDay instance for midnight", () => {
    const time = TimeOfDay.create("00:00");
    expect(time.value).toBe("00:00");
  });

  it("should throw InvalidTimeFormatError for invalid format (missing minutes)", () => {
    expect(() => TimeOfDay.create("14")).toThrow(InvalidTimeFormatError);
  });

  it("should throw InvalidTimeFormatError for invalid format (invalid hour)", () => {
    expect(() => TimeOfDay.create("25:00")).toThrow(InvalidTimeFormatError);
  });

  it("should throw InvalidTimeFormatError for invalid format (invalid minute)", () => {
    expect(() => TimeOfDay.create("10:60")).toThrow(InvalidTimeFormatError);
  });

  it("should throw InvalidTimeFormatError for an empty string", () => {
    expect(() => TimeOfDay.create("")).toThrow(InvalidTimeFormatError);
  });

  it("should throw InvalidTimeFormatError for a null input", () => {
    expect(() => TimeOfDay.create(null as any)).toThrow(InvalidTimeFormatError);
  });

  it("should correctly compare times (isBefore)", () => {
    const time1 = TimeOfDay.create("10:00");
    const time2 = TimeOfDay.create("11:00");
    expect(time1.isBefore(time2)).toBe(true);
    expect(time2.isBefore(time1)).toBe(false);
  });

  it("should correctly compare times (isAfter)", () => {
    const time1 = TimeOfDay.create("10:00");
    const time2 = TimeOfDay.create("11:00");
    expect(time2.isAfter(time1)).toBe(true);
    expect(time1.isAfter(time2)).toBe(false);
  });

  it("should correctly compare equal times", () => {
    const time1 = TimeOfDay.create("12:15");
    const time2 = TimeOfDay.create("12:15");
    expect(time1.equals(time2)).toBe(true);
    expect(time1.isBefore(time2)).toBe(false);
    expect(time1.isAfter(time2)).toBe(false);
  });
});
