import { type IClassroomRepository } from "@/domain/repositories/iclassroom.repository.js";
import { type ClassroomDto } from "@/application/dtos/classroom.dto.js";

export class GetAllClassroomsUseCase {
  constructor(private readonly classroomRepo: IClassroomRepository) {}

  public async execute(): Promise<ClassroomDto[]> {
    const classrooms = await this.classroomRepo.findAll();

    classrooms.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type.localeCompare(b.type);
      }
      return a.name.localeCompare(b.name);
    });

    return classrooms.map((c) => ({
      id: c.id.value,
      name: c.name,
      type: c.type,
      capacity: c.capacity,
    }));
  }
}
