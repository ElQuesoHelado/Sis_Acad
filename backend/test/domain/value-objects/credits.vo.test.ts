/**
 * @file tests/domain/value-objects/credits.vo.test.ts
 * @fileoverview Unit tests for the Credits Value Object.
 */

import { describe, it, expect } from "vitest";
import { Credits } from "@/domain/value-objects/credits.vo.js";
import { InvalidCreditsError } from "@/domain/errors/index.js";

describe("Domain > Value Object: Credits", () => {
  it("should create a valid Credits instance", () => {
    const credits = Credits.create(4);
    expect(credits).toBeInstanceOf(Credits);
    expect(credits.value).toBe(4);
  });

  it("should throw InvalidCreditsError for zero credits", () => {
    expect(() => Credits.create(0)).toThrow(InvalidCreditsError);
  });

  it("should throw InvalidCreditsError for negative credits", () => {
    expect(() => Credits.create(-1)).toThrow(InvalidCreditsError);
  });

  it("should throw InvalidCreditsError for non-integer credits", () => {
    expect(() => Credits.create(3.5)).toThrow(InvalidCreditsError);
  });

  it("should throw InvalidCreditsError for non-number input", () => {
    expect(() => Credits.create("4" as any)).toThrow(InvalidCreditsError);
  });

  it("should correctly compare two equal VOs", () => {
    const credits1 = Credits.create(3);
    const credits2 = Credits.create(3);
    expect(credits1.equals(credits2)).toBe(true);
  });

  it("should return the primitive value using toString()", () => {
    const credits = Credits.create(5);
    expect(credits.toString()).toBe("5");
  });
});
