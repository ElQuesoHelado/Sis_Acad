/**
 * @file src/domain/entities/base/entity.base.ts
 * @fileoverview Abstract base class for all domain entities.
 */

import type { Id } from "@/domain/value-objects/id.vo.js";

/**
 * Abstract base class for all domain entities.
 * All entities must have a unique identity.
 */
export abstract class Entity {
  /** The unique identifier of the entity as a Value Object. */
  public readonly id: Id;

  /**
   * @param id - The Value Object representing the entity's unique identifier.
   */
  constructor(id: Id) {
    this.id = id;
  }

  /**
   * Compares this entity with another for equality based on their IDs.
   * @param entity - The other entity to compare against.
   * @returns `true` if the entities have the same ID, `false` otherwise.
   */
  public equals(entity: Entity): boolean {
    if (!entity) return false;
    if (!(entity instanceof Entity)) return false;

    // Compare using the .equals() method of the Id Value Object
    return this.id.equals(entity.id);
  }
}
