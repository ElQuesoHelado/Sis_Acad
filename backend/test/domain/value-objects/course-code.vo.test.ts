import { describe, it, expect } from "vitest";
import { CourseCode } from "@/domain/value-objects/course-code.vo.js";
import { InvalidCourseCodeError } from "@/domain/errors/index.js";

describe("Domain > Value Object: CourseCode", () => {
  it("should create a valid CourseCode instance", () => {
    const validCode = "11701101";
    const codeVO = CourseCode.create(validCode);

    expect(codeVO).toBeInstanceOf(CourseCode);
    expect(codeVO.value).toBe(validCode);
  });

  it("should normalize (trim) the code", () => {
    const rawCode = "  11701102  ";
    const codeVO = CourseCode.create(rawCode);
    expect(codeVO.value).toBe("11701102");
  });

  it("should throw InvalidCourseCodeError for a code with letters", () => {
    const invalidCode = "1170110A";
    expect(() => CourseCode.create(invalidCode)).toThrow(
      InvalidCourseCodeError,
    );
  });

  it("should throw InvalidCourseCodeError for a code that is too short", () => {
    const shortCode = "1234567";
    expect(() => CourseCode.create(shortCode)).toThrow(InvalidCourseCodeError);
  });

  it("should throw InvalidCourseCodeError for a code that is too long", () => {
    const longCode = "123456789";
    expect(() => CourseCode.create(longCode)).toThrow(InvalidCourseCodeError);
  });

  it("should throw InvalidCourseCodeError for an empty string", () => {
    const emptyCode = "";
    expect(() => CourseCode.create(emptyCode)).toThrow(InvalidCourseCodeError);
  });

  it("should throw InvalidCourseCodeError for a null input", () => {
    expect(() => CourseCode.create(null as any)).toThrow(
      InvalidCourseCodeError,
    );
  });

  it("should correctly compare two equal VOs", () => {
    const code1 = CourseCode.create("11112222");
    const code2 = CourseCode.create("  11112222  ");
    expect(code1.equals(code2)).toBe(true);
  });

  it("should correctly compare two different VOs", () => {
    const code1 = CourseCode.create("11112222");
    const code2 = CourseCode.create("33334444");
    expect(code1.equals(code2)).toBe(false);
  });

  it("should return the primitive value using toString()", () => {
    const code = CourseCode.create("11701101");
    expect(code.toString()).toBe("11701101");
  });
});
