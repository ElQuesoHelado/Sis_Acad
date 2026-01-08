import {
  type IEnrollmentRepository,
  type ITheoryGroupRepository,
  type ILabGroupRepository,
  type IClassScheduleRepository,
  type ICourseRepository,
  type IClassroomRepository,
  type IUserRepository,
} from "@/domain/repositories/index.js";
import { Id, AcademicSemester } from "@/domain/value-objects/index.js";
import { type StudentScheduleEntryDto } from "@/application/dtos/schedule.dto.js";
import type { User } from "@/domain/entities/user.entity.js";
import { DayOfWeek } from "@/domain/enums/day-of-week.enum.js";

const formatProfessorName = (user: User | null): string => {
  return user ? `${user.name} ${user.surname}` : "Pending";
};

/**
 * Use case to get a student's schedule for a given semester.
 */
export class GetStudentScheduleUseCase {
  constructor(
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly theoryGroupRepository: ITheoryGroupRepository,
    private readonly labGroupRepository: ILabGroupRepository,
    private readonly classScheduleRepository: IClassScheduleRepository,
    private readonly courseRepository: ICourseRepository,
    private readonly classroomRepository: IClassroomRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Executes the use case.
   * @param studentProfileId - The authenticated student's profile ID
   * @param semester - The academic semester (e.g., "2025-II")
   * @returns A list of schedule entries DTOs
   */
  public async execute(
    studentProfileId: string,
    semester: string,
  ): Promise<StudentScheduleEntryDto[]> {
    const studentIdVO = Id.create(studentProfileId);
    const semesterVO = AcademicSemester.create(semester);

    const scheduleEntries: StudentScheduleEntryDto[] = [];

    const allEnrollments =
      await this.enrollmentRepository.findByStudent(studentIdVO);

    for (const enrollment of allEnrollments) {
      const theoryGroup = await this.theoryGroupRepository.findById(
        enrollment.theoryGroupId,
      );
      if (!theoryGroup || !theoryGroup.semester.equals(semesterVO)) {
        continue; // Skip enrollments not in the requested semester
      }

      // Load common data: course and theory professor
      const course = await this.courseRepository.findById(theoryGroup.courseId);
      const courseName = course?.name ?? "Curso Desconocido";
      const theoryProf = await this.userRepository.findById(
        theoryGroup.professorId,
      );

      // Process THEORY class schedules
      const theorySchedules =
        await this.classScheduleRepository.findByTheoryGroup(theoryGroup.id);

      for (const schedule of theorySchedules) {
        const classroom = await this.classroomRepository.findById(
          schedule.classroomId,
        );
        scheduleEntries.push({
          courseName: courseName,
          groupType: "Teoria",
          groupLetter: theoryGroup.groupLetter.value,
          day: schedule.timeSlot.day,
          startTime: schedule.timeSlot.startTime.value,
          endTime: schedule.timeSlot.endTime.value,
          classroomName: classroom?.name ?? "Aula Desconocida",
          professorName: formatProfessorName(theoryProf),
        });
      }

      // Process LAB class schedules if student is enrolled in a lab group
      if (enrollment.labGroupId) {
        const labGroup = await this.labGroupRepository.findById(
          enrollment.labGroupId,
        );
        if (!labGroup) continue;

        const labProf = await this.userRepository.findById(
          labGroup.professorId,
        );
        const labSchedules = await this.classScheduleRepository.findByLabGroup(
          labGroup.id,
        );

        for (const schedule of labSchedules) {
          const classroom = await this.classroomRepository.findById(
            schedule.classroomId,
          );
          scheduleEntries.push({
            courseName: courseName,
            groupType: "Lab",
            groupLetter: labGroup.groupLetter.value,
            day: schedule.timeSlot.day,
            startTime: schedule.timeSlot.startTime.value,
            endTime: schedule.timeSlot.endTime.value,
            classroomName: classroom?.name ?? "Lab Desconocido",
            professorName: formatProfessorName(labProf),
          });
        }
      }
    }

    // Sort schedule by day and start time
    scheduleEntries.sort((a, b) => {
      const dayOrder =
        Object.values(DayOfWeek).indexOf(a.day) -
        Object.values(DayOfWeek).indexOf(b.day);
      if (dayOrder !== 0) return dayOrder;
      return a.startTime.localeCompare(b.startTime);
    });

    return scheduleEntries;
  }
}
