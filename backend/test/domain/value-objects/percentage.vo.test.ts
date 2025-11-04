import { describe, it, expect } from "vitest";
import { Percentage } from "@/domain/value-objects/percentage.vo.js";
import { InvalidPercentageError } from "@/domain/errors/index.js";

describe("Domain > Value Object: Percentage", () => {
  it("should create a valid Percentage instance for 0", () => {
    const percentage = Percentage.create(0);
    expect(percentage.value).toBe(0);
  });

  it("should create a valid Percentage instance for 100", () => {
    const percentage = Percentage.create(100);
    expect(percentage.value).toBe(100);
  });

  it("should create a valid Percentage instance for 50.5 (decimal)", () => {
    const percentage = Percentage.create(50.5);
    expect(percentage.value).toBe(50.5);
  });

  it("should throw InvalidPercentageError for a negative number", () => {
    expect(() => Percentage.create(-1)).toThrow(InvalidPercentageError);
  });

  it("should throw InvalidPercentageError for a number over 100", () => {
    expect(() => Percentage.create(101)).toThrow(InvalidPercentageError);
  });

  it("should throw InvalidPercentageError for non-number input", () => {
    expect(() => Percentage.create(null as any)).toThrow(
      InvalidPercentageError,
    );
  });

  it("should correctly compare two equal VOs", () => {
    const code1 = Percentage.create(10);
    const code2 = Percentage.create(10);
    expect(code1.equals(code2)).toBe(true);
  });

  it("should correctly compare two different VOs", () => {
    const code1 = Percentage.create(20);
    const code2 = Percentage.create(10);
    expect(code1.equals(code2)).toBe(false);
  });

  it("should return the primitive value using toString()", () => {
    const code = Percentage.create(20.5);
    expect(code.toString()).toBe("20.5");
  });
});
