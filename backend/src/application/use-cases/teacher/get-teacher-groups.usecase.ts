import {
  type ITheoryGroupRepository,
  type ILabGroupRepository,
  type ICourseRepository,
  type IClassScheduleRepository,
} from "@/domain/repositories/index.js";
import { Id, AcademicSemester } from "@/domain/value-objects/index.js";
import { type TeacherGroupDto } from "@/application/dtos/teacher-group.dto.js";
import { ClassType } from "@/domain/enums/index.js";
import type { LabGroup } from "@/domain/entities/lab-group.entity.js";

/**
 * Use Case: Retrieve all groups (theory and lab) assigned to a teacher
 * during a specific academic semester.
 */
export class GetTeacherGroupsUseCase {
  constructor(
    private readonly theoryGroupRepository: ITheoryGroupRepository,
    private readonly labGroupRepository: ILabGroupRepository,
    private readonly courseRepository: ICourseRepository,
    private readonly classScheduleRepository: IClassScheduleRepository,
  ) {}

  /**
   * Returns the list of groups (theory + lab) assigned to the teacher during a semester.
   */
  public async execute(
    teacherUserId: string,
    semester: string,
  ): Promise<TeacherGroupDto[]> {
    const teacherIdVO = Id.create(teacherUserId);
    const semesterVO = AcademicSemester.create(semester);

    const groupsDtoList: TeacherGroupDto[] = [];
    const theoryGroups =
      await this.theoryGroupRepository.findByProfessorAndSemester(
        teacherIdVO,
        semesterVO,
      );

    // Theory
    for (const group of theoryGroups) {
      const course = await this.courseRepository.findById(group.courseId);

      groupsDtoList.push({
        groupId: group.id.value,
        courseName: course?.name ?? "Curso Desconocido",
        groupType: ClassType.THEORY,
        groupLetter: group.groupLetter.value,
      });
    }

    // Labs
    const allLabGroups =
      await this.labGroupRepository.findByProfessor(teacherIdVO);

    const labGroups = await this.filterLabGroupsBySemester(
      allLabGroups,
      semesterVO,
    );

    for (const group of labGroups) {
      const course = await this.courseRepository.findById(group.courseId);

      groupsDtoList.push({
        groupId: group.id.value,
        courseName: course?.name ?? "Curso Desconocido",
        groupType: ClassType.LAB,
        groupLetter: group.groupLetter.value,
      });
    }

    return groupsDtoList;
  }

  /**
   * Returns only the lab groups that are active during the target semester.
   */
  private async filterLabGroupsBySemester(
    groups: LabGroup[],
    semester: AcademicSemester,
  ): Promise<LabGroup[]> {
    const validLabGroups: LabGroup[] = [];

    for (const group of groups) {
      const schedules = await this.classScheduleRepository.findByLabGroup(
        group.id,
      );

      const belongsToSemester = schedules.some((s) =>
        s.semester.equals(semester),
      );

      if (belongsToSemester) {
        validLabGroups.push(group);
      }
    }

    return validLabGroups;
  }
}
