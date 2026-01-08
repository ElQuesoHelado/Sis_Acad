import { type ILabGroupRepository, type IClassScheduleRepository, type IClassroomRepository } from "@/domain/repositories/index.js";
import { Id } from "@/domain/value-objects/index.js";

export class GetAllLabGroupsUseCase {
  constructor(
    private readonly labRepo: ILabGroupRepository,
    private readonly classScheduleRepo: IClassScheduleRepository,
    private readonly classroomRepo: IClassroomRepository
  ) {}

  public async execute() {
    const labs = await this.labRepo.findAll();

    // Create result array with schedule information
    const result = [];

    for (const lab of labs) {
      // Get schedules for this lab group
      const schedules = await this.classScheduleRepo.findByLabGroup(lab.id);

      // Get classroom info for each schedule
      const scheduleDetails = await Promise.all(
        schedules.map(async (schedule) => {
          const classroom = await this.classroomRepo.findById(schedule.classroomId);

          return {
            day: schedule.timeSlot.day.toString(), // Convert to string if needed
            time: `${schedule.timeSlot.startTime}-${schedule.timeSlot.endTime}`,
            classroom: classroom?.name || 'Desconocido'
          };
        })
      );

      result.push({
        id: lab.id.value,
        groupLetter: lab.groupLetter.value,
        capacity: lab.capacity,
        enrolled: lab.currentEnrollment,
        isFull: lab.isFull(),
        courseId: lab.courseId.value,
        professorId: lab.professorId.value,
        schedules: scheduleDetails
      });
    }

    return result;
  }
}
