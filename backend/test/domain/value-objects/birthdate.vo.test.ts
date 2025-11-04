import { describe, it, expect } from "vitest";
import { Birthdate } from "@/domain/value-objects/birthdate.vo.js";
import { InvalidBirthdateError } from "@/domain/errors/validation.errors.js";

describe("Domain > Value Object: Birthdate", () => {
  it("should create a valid birthdate from a string", () => {
    const dateStr = "1990-05-15";
    const bdate = Birthdate.create(dateStr);
    expect(bdate).toBeInstanceOf(Birthdate);
    expect(bdate.value.getFullYear()).toBe(1990);
  });

  it("should create a valid birthdate from a Date object", () => {
    const dateObj = new Date("1995-10-20T00:00:00.000Z");
    const bdate = Birthdate.create(dateObj);
    expect(bdate.value).toEqual(dateObj);
  });

  it("should throw InvalidBirthdateError for a future date", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    expect(() => Birthdate.create(futureDate)).toThrow(InvalidBirthdateError);
  });

  it("should throw InvalidBirthdateError for an invalid date string", () => {
    const invalidDate = "esto no es una fecha";
    expect(() => Birthdate.create(invalidDate)).toThrow(InvalidBirthdateError);
  });

  it("should throw InvalidBirthdateError for a null input", () => {
    expect(() => Birthdate.create(null as any)).toThrow(InvalidBirthdateError);
  });

  it("should throw InvalidBirthdateError for an undefined input", () => {
    expect(() => Birthdate.create(undefined as any)).toThrow(
      InvalidBirthdateError,
    );
  });

  it("should correctly compare two equal date objects", () => {
    const date1 = Birthdate.create("1990-01-01");
    const date2 = Birthdate.create("1990-01-01");
    expect(date1.equals(date2)).toBe(true);
  });

  it("should correctly compare two different date objects", () => {
    const date1 = Birthdate.create("1990-01-01");
    const date2 = Birthdate.create("1990-01-02");
    expect(date1.equals(date2)).toBe(false);
  });

  it("should return an ISO string using toString()", () => {
    const date = Birthdate.create("1990-01-01T00:00:00.000Z");
    expect(date.toString()).toBe("1990-01-01T00:00:00.000Z");
  });
});
