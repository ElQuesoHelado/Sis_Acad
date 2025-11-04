/**
 * @file Defines the GradeWeight entity.
 */
import { Entity } from "./base/entity.base.js";
import { Id, Percentage } from "../value-objects/index.js";
import { GradeType } from "../enums/index.js";
import { DomainError } from "../errors/base/error.base.js";
import {
  GradeWeightCreationError,
  InvalidGradeWeightSumError,
  InvalidGradeWeightTypeError,
} from "../errors/grade-weight.errors.js";

/**
 * Raw properties for the factory method.
 */
export interface GradeWeightCreateProps {
  id: string;
  theoryGroupId: string;
  type: GradeType;
  weight: number; // The percentage value (e.g., 20)
}

/**
 * Internal validated properties.
 */
interface GradeWeightProps {
  id: Id;
  theoryGroupId: Id;
  type: GradeType;
  weight: Percentage;
}

/**
 * Represents the weight (percentage) for a specific GradeType
 * (e.g., PARTIAL_1) within a TheoryGroup.
 * @extends Entity
 */
export class GradeWeight extends Entity {
  public readonly theoryGroupId: Id;
  public readonly type: GradeType;
  public weight: Percentage;

  private constructor(props: GradeWeightProps) {
    super(props.id);
    this.theoryGroupId = props.theoryGroupId;
    this.type = props.type;
    this.weight = props.weight;
  }

  /**
   * Factory method to create a new GradeWeight.
   * @param props - Raw properties.
   * @returns A new, validated GradeWeight instance.
   */
  public static create(props: GradeWeightCreateProps): GradeWeight {
    try {
      // Validate that the type is a valid GradeType
      if (!Object.values(GradeType).includes(props.type)) {
        throw new InvalidGradeWeightTypeError(props.type);
      }

      // Create the Percentage VO, which validates 0-100
      const weightVO = Percentage.create(props.weight);

      return new GradeWeight({
        id: Id.create(props.id),
        theoryGroupId: Id.create(props.theoryGroupId),
        type: props.type,
        weight: weightVO,
      });
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new GradeWeightCreationError(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Business rule: Validates that a set of weights totals 100%.
   * @param weights - Array of GradeWeight entities for a single group.
   * @throws {InvalidGradeWeightSumError} if the sum is not 100.
   */
  public static validateWeights(weights: GradeWeight[]): void {
    if (weights.length === 0) return;

    const totalWeight = weights.reduce((sum, w) => sum + w.weight.value, 0);

    // Allow a small margin for floating point issues
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new InvalidGradeWeightSumError(totalWeight);
    }
  }
}
