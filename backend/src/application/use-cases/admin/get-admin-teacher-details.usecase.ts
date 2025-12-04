import {
  type ITheoryGroupRepository,
  type ILabGroupRepository,
  type IClassScheduleRepository,
  type ICourseRepository,
  type IClassroomRepository,
  type ITeacherProfileRepository,
} from "@/domain/repositories/index.js";
import { Id, AcademicSemester } from "@/domain/value-objects/index.js";
import { type TeacherScheduleEntryDto } from "@/application/dtos/teacher-schedule.dto.js";
import { type TeacherGroupDto } from "@/application/dtos/teacher-group.dto.js";
import { ClassType } from "@/domain/enums/index.js";

export interface AdminTeacherDetailsDto {
  groups: TeacherGroupDto[];
  schedule: TeacherScheduleEntryDto[];
}

export class GetAdminTeacherDetailsUseCase {
  constructor(
    private readonly teacherProfileRepo: ITeacherProfileRepository,
    private readonly theoryGroupRepo: ITheoryGroupRepository,
    private readonly labGroupRepo: ILabGroupRepository,
    private readonly scheduleRepo: IClassScheduleRepository,
    private readonly courseRepo: ICourseRepository,
    private readonly classroomRepo: IClassroomRepository
  ) { }

  public async execute(
    userId: string,
    semester: string
  ): Promise<AdminTeacherDetailsDto> {
    const teacherUserIdVO = Id.create(userId);
    const semesterVO = AcademicSemester.create(semester);

    const profile = await this.teacherProfileRepo.findByUserId(teacherUserIdVO);
    if (!profile) {
      throw new Error("User is not a professor or has no profile.");
    }

    const theoryGroups = await this.theoryGroupRepo.findByProfessorAndSemester(
      teacherUserIdVO,
      semesterVO
    );
    const allLabGroups = await this.labGroupRepo.findByProfessor(teacherUserIdVO);

    const validLabGroups = [];
    for (const group of allLabGroups) {
      const schedules = await this.scheduleRepo.findByLabGroup(group.id);
      if (schedules.some((s) => s.semester.equals(semesterVO))) {
        validLabGroups.push(group);
      }
    }

    const groupsDto: TeacherGroupDto[] = [];

    for (const group of theoryGroups) {
      const course = await this.courseRepo.findById(group.courseId);
      groupsDto.push({
        groupId: group.id.value,
        courseName: course?.name ?? "Unknown",
        groupType: ClassType.THEORY,
        groupLetter: group.groupLetter.value,
      });
    }
    for (const group of validLabGroups) {
      const course = await this.courseRepo.findById(group.courseId);
      groupsDto.push({
        groupId: group.id.value,
        courseName: course?.name ?? "Unknown",
        groupType: ClassType.LAB,
        groupLetter: group.groupLetter.value,
      });
    }

    const scheduleDto: TeacherScheduleEntryDto[] = [];

    for (const group of theoryGroups) {
      const schedules = await this.scheduleRepo.findByTheoryGroup(group.id);
      const course = await this.courseRepo.findById(group.courseId);

      for (const s of schedules) {
        const room = await this.classroomRepo.findById(s.classroomId);
        scheduleDto.push({
          courseName: course?.name ?? "Unknown",
          groupType: "Teoria",
          groupLetter: group.groupLetter.value,
          day: s.timeSlot.day,
          startTime: s.timeSlot.startTime.value,
          endTime: s.timeSlot.endTime.value,
          classroomName: room?.name ?? "Unknown",
        });
      }
    }

    for (const group of validLabGroups) {
      const schedules = await this.scheduleRepo.findByLabGroup(group.id);
      const semSchedules = schedules.filter(s => s.semester.equals(semesterVO));
      const course = await this.courseRepo.findById(group.courseId);

      for (const s of semSchedules) {
        const room = await this.classroomRepo.findById(s.classroomId);
        scheduleDto.push({
          courseName: course?.name ?? "Unknown",
          groupType: "Labo",
          groupLetter: group.groupLetter.value,
          day: s.timeSlot.day,
          startTime: s.timeSlot.startTime.value,
          endTime: s.timeSlot.endTime.value,
          classroomName: room?.name ?? "Unknown",
        });
      }
    }

    return { groups: groupsDto, schedule: scheduleDto };
  }
}
