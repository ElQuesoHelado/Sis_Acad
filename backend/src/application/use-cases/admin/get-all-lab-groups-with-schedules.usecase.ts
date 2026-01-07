import {
  type ILabGroupRepository,
  type IClassScheduleRepository,
  type ICourseRepository,
  type IClassroomRepository,
  type IUserRepository,
} from "@/domain/repositories/index.js";
import { type AvailableLabGroupDto } from "@/application/dtos/lab-group.dto.js";

export interface LabGroupWithScheduleDto {
  id: string;
  groupLetter: string;
  capacity: number;
  currentEnrollment: number;
  isFull: boolean;
  courseId: string;
  courseName: string;
  professorId: string;
  professorName: string;
  schedules: {
    day: string;
    time: string;
    classroom: string;
  }[];
}

export class GetAllLabGroupsWithSchedulesUseCase {
  constructor(
    private readonly labGroupRepo: ILabGroupRepository,
    private readonly scheduleRepo: IClassScheduleRepository,
    private readonly courseRepo: ICourseRepository,
    private readonly classroomRepo: IClassroomRepository,
    private readonly userRepo: IUserRepository
  ) {}

  public async execute(): Promise<LabGroupWithScheduleDto[]> {
    const labGroups = await this.labGroupRepo.findAll();

    const result: LabGroupWithScheduleDto[] = [];

    for (const labGroup of labGroups) {
      const course = await this.courseRepo.findById(labGroup.courseId);
      const professorUser = await this.userRepo.findById(labGroup.professorId);

      const schedules = await this.scheduleRepo.findByLabGroup(labGroup.id);

      const scheduleDtos = await Promise.all(
        schedules.map(async (schedule) => {
          const classroom = await this.classroomRepo.findById(schedule.classroomId);
          return {
            day: schedule.timeSlot.day,
            time: `${schedule.timeSlot.startTime.value}-${schedule.timeSlot.endTime.value}`,
            classroom: classroom?.name ?? "Unknown",
          };
        })
      );

      result.push({
        id: labGroup.id.value,
        groupLetter: labGroup.groupLetter.value,
        capacity: labGroup.capacity,
        currentEnrollment: labGroup.currentEnrollment,
        isFull: labGroup.isFull(),
        courseId: labGroup.courseId.value,
        courseName: course?.name ?? "Unknown",
        professorId: labGroup.professorId.value,
        professorName: professorUser ? `${professorUser.name} ${professorUser.surname}` : "Unknown",
        schedules: scheduleDtos,
      });
    }

    return result;
  }
}