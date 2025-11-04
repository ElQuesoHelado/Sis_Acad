import { describe, it, expect } from "vitest";
import { Email } from "@/domain/value-objects/email.vo.js";
import { InvalidEmailError } from "@/domain/errors/validation.errors.js";

describe("Domain > Value Object: Email", () => {
  it("should create a valid Email and normalize it (trim and lowercase)", () => {
    const rawEmail = "  TEST.User@Google.COM  ";
    const email = Email.create(rawEmail);
    expect(email).toBeInstanceOf(Email);
    expect(email.value).toBe("test.user@google.com");
  });

  it("should throw InvalidEmailError for an invalid email format", () => {
    const invalidEmail = "not-an-email.com";
    expect(() => Email.create(invalidEmail)).toThrow(InvalidEmailError);
  });

  it("should throw InvalidEmailError for an empty string", () => {
    const emptyEmail = "";
    expect(() => Email.create(emptyEmail)).toThrow(InvalidEmailError);
  });

  it("should throw InvalidEmailError for a string with only whitespace", () => {
    const whitespaceEmail = "    ";
    expect(() => Email.create(whitespaceEmail)).toThrow(InvalidEmailError);
  });

  it("should throw InvalidEmailError for a null input", () => {
    expect(() => Email.create(null as any)).toThrow(InvalidEmailError);
  });

  it("should throw InvalidEmailError for an undefined input", () => {
    expect(() => Email.create(undefined as any)).toThrow(InvalidEmailError);
  });

  it("should correctly compare two equal email VOs", () => {
    const email1 = Email.create("user@example.com");
    const email2 = Email.create("  user@example.com  ");
    expect(email1.equals(email2)).toBe(true);
  });

  it("should correctly compare two different email VOs", () => {
    const email1 = Email.create("user1@example.com");
    const email2 = Email.create("user2@example.com");
    expect(email1.equals(email2)).toBe(false);
  });

  it("should return the primitive value using toString()", () => {
    const email = Email.create("user@example.com");
    expect(email.toString()).toBe("user@example.com");
  });
});
