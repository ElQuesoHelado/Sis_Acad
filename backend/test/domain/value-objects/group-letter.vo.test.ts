import { describe, it, expect } from "vitest";
import { GroupLetter } from "@/domain/value-objects/group-letter.vo.js";
import { InvalidGroupLetterError } from "@/domain/errors/index.js";

describe("Domain > Value Object: GroupLetter", () => {
  it("should create a valid GroupLetter instance", () => {
    const letter = GroupLetter.create("A");
    expect(letter).toBeInstanceOf(GroupLetter);
    expect(letter.value).toBe("A");
  });

  it("should normalize (trim) the letter", () => {
    const letter = GroupLetter.create("  B  ");
    expect(letter.value).toBe("B");
  });

  it("should throw InvalidGroupLetterError for a lowercase letter", () => {
    expect(() => GroupLetter.create("a")).toThrow(InvalidGroupLetterError);
  });

  it("should throw InvalidGroupLetterError for multiple letters", () => {
    expect(() => GroupLetter.create("AB")).toThrow(InvalidGroupLetterError);
  });

  it("should throw InvalidGroupLetterError for a number", () => {
    expect(() => GroupLetter.create("1")).toThrow(InvalidGroupLetterError);
  });

  it("should throw InvalidGroupLetterError for an empty string", () => {
    expect(() => GroupLetter.create("")).toThrow(InvalidGroupLetterError);
  });

  it("should throw InvalidGroupLetterError for null input", () => {
    expect(() => GroupLetter.create(null as any)).toThrow(
      InvalidGroupLetterError,
    );
  });

  it("should correctly compare two equal VOs", () => {
    const letter1 = GroupLetter.create("C");
    const letter2 = GroupLetter.create("  C  ");
    expect(letter1.equals(letter2)).toBe(true);
  });

  it("should correctly compare two different VOs", () => {
    const letter1 = GroupLetter.create("A");
    const letter2 = GroupLetter.create("B");
    expect(letter1.equals(letter2)).toBe(false);
  });

  it("should return the primitive value using toString()", () => {
    const letter = GroupLetter.create("Z");
    expect(letter.toString()).toBe("Z");
  });
});
