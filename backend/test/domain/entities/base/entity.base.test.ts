import { describe, it, expect } from "vitest";
import { Entity } from "@/domain/entities/base/entity.base.js";
import { Id } from "@/domain/value-objects/index.js";

class DummyEntity extends Entity {
  constructor(id: Id) {
    super(id);
  }
}
class AnotherDummyEntity extends Entity {
  constructor(id: Id) {
    super(id);
  }
}

describe("Domain > Entity > Entity Base Class", () => {
  const id1 = Id.create("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
  const id2 = Id.create("123e4567-e89b-12d3-a456-426614174000");

  const entityA = new DummyEntity(id1);
  const entityA_copy = new AnotherDummyEntity(id1);
  const entityB = new DummyEntity(id2);

  it("should store the Id Value Object correctly", () => {
    expect(entityA.id).toBeInstanceOf(Id);
    expect(entityA.id.value).toBe("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
  });

  it("should return true for entities of the same class with the same ID", () => {
    const sameEntity = new DummyEntity(id1);
    expect(entityA.equals(sameEntity)).toBe(true);
  });

  it("should return false for entities of the same class with different IDs", () => {
    expect(entityA.equals(entityB)).toBe(false);
  });

  it("should return false when comparing with null", () => {
    expect(entityA.equals(null as any)).toBe(false);
  });

  it("should return false when comparing with undefined", () => {
    expect(entityA.equals(undefined as any)).toBe(false);
  });

  it("should return false when comparing with a plain object", () => {
    const plainObject = { id: id1 };
    expect(entityA.equals(plainObject as any)).toBe(false);
  });

  it("should return true for entities of different classes but with the same ID", () => {
    expect(entityA.equals(entityA_copy)).toBe(true);
  });
});
