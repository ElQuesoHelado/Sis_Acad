import { describe, it, expect } from "vitest";
import { StudentCode } from "@/domain/value-objects/student-code.vo.js";
import { InvalidStudentCodeError } from "@/domain/errors/index.js";

describe("Domain > Value Object: StudentCode", () => {
  it("should create a valid StudentCode instance", () => {
    const validCode = "20201234";
    const codeVO = StudentCode.create(validCode);

    expect(codeVO).toBeInstanceOf(StudentCode);
    expect(codeVO.value).toBe(validCode);
  });

  it("should normalize (trim) the code", () => {
    const rawCode = "  20214321  ";
    const codeVO = StudentCode.create(rawCode);
    expect(codeVO.value).toBe("20214321");
  });

  it("should throw InvalidStudentCodeError for a code with letters", () => {
    const invalidCode = "2020123A";
    expect(() => StudentCode.create(invalidCode)).toThrow(
      InvalidStudentCodeError,
    );
  });

  it("should throw InvalidStudentCodeError for a code that is too short", () => {
    const shortCode = "1234567";
    expect(() => StudentCode.create(shortCode)).toThrow(
      InvalidStudentCodeError,
    );
  });

  it("should throw InvalidStudentCodeError for a code that is too long", () => {
    const longCode = "123456789";
    expect(() => StudentCode.create(longCode)).toThrow(InvalidStudentCodeError);
  });

  it("should throw InvalidStudentCodeError for an empty string", () => {
    const emptyCode = "";
    expect(() => StudentCode.create(emptyCode)).toThrow(
      InvalidStudentCodeError,
    );
  });

  it("should throw InvalidStudentCodeError for a null input", () => {
    expect(() => StudentCode.create(null as any)).toThrow(
      InvalidStudentCodeError,
    );
  });

  it("should correctly compare two equal VOs", () => {
    const code1 = StudentCode.create("20221111");
    const code2 = StudentCode.create("  20221111  ");
    expect(code1.equals(code2)).toBe(true);
  });

  it("should correctly compare two different VOs", () => {
    const code1 = StudentCode.create("20221111");
    const code2 = StudentCode.create("20222222");
    expect(code1.equals(code2)).toBe(false);
  });
  it("should return the primitive value using toString()", () => {
    const code = StudentCode.create("20201234");
    expect(code.toString()).toBe("20201234");
  });
});
