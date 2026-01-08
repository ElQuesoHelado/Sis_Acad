import { type ILabGroupRepository } from "@/domain/repositories/index.js";
import { Id } from "@/domain/value-objects/index.js";
import { LabGroupNotFoundError } from "@/domain/errors/lab.errors.js";

export interface UpdateLabGroupCapacityDto {
  labGroupId: string;
  newCapacity: number;
}

export class UpdateLabGroupCapacityUseCase {
  constructor(private readonly labGroupRepo: ILabGroupRepository) {}

  public async execute(input: UpdateLabGroupCapacityDto): Promise<void> {
    const labGroupId = Id.create(input.labGroupId);
    
    const labGroup = await this.labGroupRepo.findById(labGroupId);
    if (!labGroup) {
      throw new LabGroupNotFoundError(input.labGroupId);
    }

    // The LabGroup entity already has validation for capacity update
    // It checks that new capacity is positive and not less than current enrollment
    labGroup.updateCapacity(input.newCapacity);

    await this.labGroupRepo.save(labGroup);
  }
}