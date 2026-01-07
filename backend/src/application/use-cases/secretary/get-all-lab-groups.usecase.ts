import { type ILabGroupRepository } from "@/domain/repositories/index.js";

export class GetAllLabGroupsUseCase {
  constructor(private readonly labRepo: ILabGroupRepository) {}

  public async execute() {
    const labs = await this.labRepo.findAll(); 
    
    return labs.map(lab => ({
      id: lab.id.value,
      groupLetter: lab.groupLetter.value,
      capacity: lab.capacity,
      enrolled: lab.currentEnrollment,
      isFull: lab.isFull(),
      courseId: lab.courseId.value, 
      professorId: lab.professorId.value
    }));
  }
}
