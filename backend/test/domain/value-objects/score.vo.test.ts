import { describe, it, expect } from "vitest";
import { Score } from "@/domain/value-objects/score.vo.js";
import { InvalidScoreError } from "@/domain/errors/index.js";

describe("Domain > Value Object: Score (0-20)", () => {
  it("should create a valid Score instance for a decimal value", () => {
    const score = Score.create(15.5);
    expect(score).toBeInstanceOf(Score);
    expect(score.value).toBe(15.5);
  });

  it("should create a valid Score instance for the lower boundary (0)", () => {
    const score = Score.create(0);
    expect(score.value).toBe(0);
  });

  it("should create a valid Score instance for the upper boundary (20)", () => {
    const score = Score.create(20);
    expect(score.value).toBe(20);
  });

  it("should throw InvalidScoreError for a negative number", () => {
    expect(() => Score.create(-1)).toThrow(InvalidScoreError);
  });

  it("should throw InvalidScoreError for a number over 20", () => {
    expect(() => Score.create(20.1)).toThrow(InvalidScoreError);
  });

  it("should throw InvalidScoreError for non-number input (null)", () => {
    expect(() => Score.create(null as any)).toThrow(InvalidScoreError);
  });

  it("should throw InvalidScoreError for non-number input (undefined)", () => {
    expect(() => Score.create(undefined as any)).toThrow(InvalidScoreError);
  });

  it("should correctly compare two equal VOs", () => {
    const score1 = Score.create(18);
    const score2 = Score.create(18);
    expect(score1.equals(score2)).toBe(true);
  });

  it("should correctly compare two different VOs", () => {
    const score1 = Score.create(18);
    const score2 = Score.create(18.5);
    expect(score1.equals(score2)).toBe(false);
  });

  it("should return the primitive value using toString()", () => {
    const score = Score.create(12.25);
    expect(score.toString()).toBe("12.25");
  });
});
