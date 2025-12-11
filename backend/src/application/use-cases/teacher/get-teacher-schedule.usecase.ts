import {
  type ITheoryGroupRepository,
  type ILabGroupRepository,
  type IClassScheduleRepository,
  type ICourseRepository,
  type IClassroomRepository,
  type IRoomReservationRepository,
} from "@/domain/repositories/index.js";
import { Id, AcademicSemester } from "@/domain/value-objects/index.js";
import type { TeacherScheduleEntryDto } from "@/application/dtos/teacher-schedule.dto.js";
import type { ClassSchedule } from "@/domain/entities/class-schedule.entity.js";
import { DayOfWeek } from "@/domain/enums/day-of-week.enum.js";
import { ReservationStatus } from "@/domain/enums/reservation-status.enum.js";

export class GetTeacherScheduleUseCase {
  constructor(
    private readonly theoryGroupRepository: ITheoryGroupRepository,
    private readonly labGroupRepository: ILabGroupRepository,
    private readonly classScheduleRepository: IClassScheduleRepository,
    private readonly courseRepository: ICourseRepository,
    private readonly classroomRepository: IClassroomRepository,
    private readonly roomReservationRepository: IRoomReservationRepository
  ) { }

  public async execute(
    teacherUserId: string,
    semester: string,
    dateIso?: string,
  ): Promise<TeacherScheduleEntryDto[]> {
    const teacherIdVO = Id.create(teacherUserId);
    const semesterVO = AcademicSemester.create(semester);
    const entries: TeacherScheduleEntryDto[] = [];


    const referenceDate = dateIso ? new Date(dateIso) : new Date();

    const day = referenceDate.getUTCDay();
    const diff = referenceDate.getUTCDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(referenceDate);
    weekStart.setUTCDate(diff);
    weekStart.setUTCHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
    weekEnd.setUTCHours(23, 59, 59, 999);


    const theoryGroups = await this.theoryGroupRepository.findByProfessorAndSemester(
      teacherIdVO,
      semesterVO,
    );
    for (const group of theoryGroups) {
      const course = await this.courseRepository.findById(group.courseId);
      const schedules = await this.classScheduleRepository.findByTheoryGroup(group.id);
      await this.addEntries(entries, schedules, course?.name ?? "Curso", "Teoria", group.groupLetter.value);
    }


    const labGroups = await this.labGroupRepository.findByProfessor(teacherIdVO);
    for (const group of labGroups) {
      const course = await this.courseRepository.findById(group.courseId);
      const schedules = await this.classScheduleRepository.findByLabGroup(group.id);
      const semesterSchedules = schedules.filter((s) => s.semester.equals(semesterVO));
      await this.addEntries(entries, semesterSchedules, course?.name ?? "Curso", "Labo", group.groupLetter.value);
    }


    const reservations = await this.roomReservationRepository.findByProfessorAndSemester(
      teacherIdVO,
      semesterVO
    );


    const activeReservations = reservations.filter(r =>
      r.status === ReservationStatus.RESERVED &&
      r.date.value >= weekStart &&
      r.date.value <= weekEnd
    );

    for (const res of activeReservations) {
      const classroom = await this.classroomRepository.findById(res.classroomId);

      const dayIndex = res.date.value.getUTCDay();
      const dayMap: Record<number, DayOfWeek> = {
        0: DayOfWeek.SUNDAY, 1: DayOfWeek.MONDAY, 2: DayOfWeek.TUESDAY,
        3: DayOfWeek.WEDNESDAY, 4: DayOfWeek.THURSDAY, 5: DayOfWeek.FRIDAY, 6: DayOfWeek.SATURDAY
      };
      const dayName = dayMap[dayIndex];
      if (!dayName) continue;

      entries.push({
        courseName: res.notes || "Reserva Sala",
        groupType: "Reserva",
        groupLetter: "N/A",
        day: dayName,
        startTime: res.startTime.value,
        endTime: res.endTime.value,
        classroomName: classroom?.name ?? "Aula",
        date: res.date.isoString
      });
    }

    return entries;
  }

  private async addEntries(
    dtoList: TeacherScheduleEntryDto[],
    schedules: ClassSchedule[],
    courseName: string,
    groupType: "Teoria" | "Labo",
    groupLetter: string,
  ): Promise<void> {
    for (const schedule of schedules) {
      const classroom = await this.classroomRepository.findById(schedule.classroomId);
      dtoList.push({
        courseName,
        groupType,
        groupLetter,
        day: schedule.timeSlot.day,
        startTime: schedule.timeSlot.startTime.value,
        endTime: schedule.timeSlot.endTime.value,
        classroomName: classroom?.name ?? "Aula",
      });
    }
  }
}
