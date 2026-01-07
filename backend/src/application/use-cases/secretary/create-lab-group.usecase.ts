import { LabGroup } from "@/domain/entities/lab-group.entity.js";
import { type ILabGroupRepository } from "@/domain/repositories/index.js";
import { v4 as uuidv4 } from "uuid";

export interface CreateLabGroupDto {
  courseId: string;
  professorId: string;
  groupLetter: string;
  capacity: number;
}

export class CreateLabGroupUseCase {
  constructor(private readonly labRepo: ILabGroupRepository) {}

  public async execute(input: CreateLabGroupDto): Promise<void> {
    const labGroup = LabGroup.create({
      id: uuidv4(),
      courseId: input.courseId,
      professorId: input.professorId,
      groupLetter: input.groupLetter,
      capacity: input.capacity,
      currentEnrollment: 0
    });

    await this.labRepo.save(labGroup);
  }
}
