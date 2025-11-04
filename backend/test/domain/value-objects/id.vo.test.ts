import { describe, it, expect } from "vitest";
import { Id } from "@/domain/value-objects/id.vo.js";
import { InvalidUuidError } from "@/domain/errors/validation.errors.js";

describe("Domain > Value Object: Id (UUID)", () => {
  it("should create a valid Id instance for a correct UUID", () => {
    const validUuid = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
    const idVO = Id.create(validUuid);

    expect(idVO).toBeInstanceOf(Id);
    expect(idVO.value).toBe(validUuid);
  });

  it("should throw InvalidUuidError for a non-UUID string", () => {
    const invalidId = "esto-no-es-un-uuid";

    expect(() => Id.create(invalidId)).toThrow(InvalidUuidError);
  });

  it("should throw InvalidUuidError for an empty string", () => {
    const emptyId = "";

    expect(() => Id.create(emptyId)).toThrow(InvalidUuidError);
  });

  it("should throw InvalidUuidError for a null input", () => {
    expect(() => Id.create(null as any)).toThrow(InvalidUuidError);
  });

  it("should throw InvalidUuidError for an undefined input", () => {
    expect(() => Id.create(undefined as any)).toThrow(InvalidUuidError);
  });

  it("should correctly compare two equal Id VOs", () => {
    const uuid = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
    const id1 = Id.create(uuid);
    const id2 = Id.create(uuid);

    expect(id1.equals(id2)).toBe(true);
  });

  it("should correctly compare two different Id VOs", () => {
    const id1 = Id.create("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
    const id2 = Id.create("123e4567-e89b-12d3-a456-426614174000");

    expect(id1.equals(id2)).toBe(false);
  });

  it("should return the primitive value using toString()", () => {
    const uuid = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
    const id = Id.create(uuid);

    expect(id.toString()).toBe(uuid);
  });
});
