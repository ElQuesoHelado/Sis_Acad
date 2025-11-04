import {
  type ITheoryGroupRepository,
  type ILabGroupRepository,
  type IClassScheduleRepository,
  type ICourseRepository,
  type IClassroomRepository,
} from "@/domain/repositories/index.js";
import { Id, AcademicSemester } from "@/domain/value-objects/index.js";
import { type TeacherScheduleEntryDto } from "@/application/dtos/teacher-schedule.dto.js";
import type { ClassSchedule } from "@/domain/entities/class-schedule.entity.js";

/**
 * Use Case: Retrieve the weekly teaching schedule for a professor.
 *
 * Notes:
 * - Theory groups are filtered by semester.
 * - Lab groups are fetched for the professor, then filtered by semester at schedule level.
 * - All returned DTO fields that the frontend sees should remain in Spanish.
 */
export class GetTeacherScheduleUseCase {
  constructor(
    private readonly theoryGroupRepository: ITheoryGroupRepository,
    private readonly labGroupRepository: ILabGroupRepository,
    private readonly classScheduleRepository: IClassScheduleRepository,
    private readonly courseRepository: ICourseRepository,
    private readonly classroomRepository: IClassroomRepository,
  ) {}

  /**
   * Executes the retrieval of the teacher's schedule for a given semester.
   */
  public async execute(
    teacherUserId: string,
    semester: string,
  ): Promise<TeacherScheduleEntryDto[]> {
    const teacherIdVO = Id.create(teacherUserId);
    const semesterVO = AcademicSemester.create(semester);

    const entries: TeacherScheduleEntryDto[] = [];

    const theoryGroups =
      await this.theoryGroupRepository.findByProfessorAndSemester(
        teacherIdVO,
        semesterVO,
      );

    const labGroups =
      await this.labGroupRepository.findByProfessor(teacherIdVO);

    for (const group of theoryGroups) {
      const course = await this.courseRepository.findById(group.courseId);
      const schedules = await this.classScheduleRepository.findByTheoryGroup(
        group.id,
      );

      await this.addEntries(
        entries,
        schedules,
        course?.name ?? "Curso Desconocido",
        "Teoria",
        group.groupLetter.value,
      );
    }

    // 4. Build schedule entries for LAB groups
    for (const group of labGroups) {
      const course = await this.courseRepository.findById(group.courseId);
      const schedules = await this.classScheduleRepository.findByLabGroup(
        group.id,
      );

      // Filter schedules by semester
      const semesterSchedules = schedules.filter((s) =>
        s.semester.equals(semesterVO),
      );

      await this.addEntries(
        entries,
        semesterSchedules,
        course?.name ?? "Curso Desconocido",
        "Labo",
        group.groupLetter.value,
      );
    }

    return entries;
  }

  /**
   * Helper: Converts class schedule entities into DTO entries.
   * All user-facing text remains in Spanish.
   */
  private async addEntries(
    dtoList: TeacherScheduleEntryDto[],
    schedules: ClassSchedule[],
    courseName: string,
    groupType: "Teoria" | "Labo",
    groupLetter: string,
  ): Promise<void> {
    for (const schedule of schedules) {
      const classroom = await this.classroomRepository.findById(
        schedule.classroomId,
      );

      dtoList.push({
        courseName,
        groupType,
        groupLetter,
        day: schedule.timeSlot.day,
        startTime: schedule.timeSlot.startTime.value,
        endTime: schedule.timeSlot.endTime.value,
        classroomName: classroom?.name ?? "Aula Desconocida",
      });
    }
  }
}
