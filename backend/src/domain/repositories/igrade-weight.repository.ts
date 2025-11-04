import type { GradeWeight } from "../entities/grade-weight.entity.js";
import type { Id } from "../value-objects/index.js";

/**
 * Repository interface for managing GradeWeight entities.
 */
export interface IGradeWeightRepository {
  /**
   * Finds all weight configurations for a specific theory group.
   * @param theoryGroupId - The Id (VO) of the TheoryGroup.
   * @returns A promise resolving to an array of GradeWeight entities.
   */
  findByTheoryGroupId(theoryGroupId: Id): Promise<GradeWeight[]>;

  /**
   * Saves (creates or updates) a single weight.
   * @param weight - The GradeWeight entity to save.
   * @returns A promise resolving when the operation completes.
   */
  save(weight: GradeWeight): Promise<void>;

  /**
   * Saves multiple weights in bulk.
   * @param weights - An array of GradeWeight entities.
   * @returns A promise resolving when the operation completes.
   */
  saveMany(weights: GradeWeight[]): Promise<void>;
}
