import {
  type IEnrollmentRepository,
  type IAttendanceRepository,
  type IClassScheduleRepository,
  type IClassroomRepository,
  type ICourseRepository,
  type ITheoryGroupRepository,
} from "@/domain/repositories/index.js";
import { Id } from "@/domain/value-objects/index.js";
import { AttendanceStatus, DayOfWeek, ClassType } from "@/domain/enums/index.js";
import {
  type StudentAttendanceReportDto,
  type StudentAttendanceReportItemDto
} from "@/application/dtos/index.js";
import { EnrollmentNotFoundError } from "@/domain/errors/index.js";
import { NotAuthorizedError } from "@/application/errors/not-authorized.error.js";

export class GetStudentAttendanceReportUseCase {
  constructor(
    private readonly enrollmentRepo: IEnrollmentRepository,
    private readonly attendanceRepo: IAttendanceRepository,
    private readonly scheduleRepo: IClassScheduleRepository,
    private readonly classroomRepo: IClassroomRepository,
    private readonly courseRepo: ICourseRepository,
    private readonly theoryGroupRepo: ITheoryGroupRepository
  ) { }

  public async execute(
    _studentProfileId: string,
    enrollmentId: string
  ): Promise<StudentAttendanceReportDto> {

    // const studentIdVO = Id.create(studentProfileId);
    const enrollmentIdVO = Id.create(enrollmentId);

    const enrollment = await this.enrollmentRepo.findById(enrollmentIdVO);
    if (!enrollment) throw new EnrollmentNotFoundError(enrollmentId);
    // if (!enrollment.studentId.equals(studentIdVO)) throw new NotAuthorizedError();

    const theoryGroup = await this.theoryGroupRepo.findById(enrollment.theoryGroupId);
    if (!theoryGroup) {
      throw new Error("Integrity Error: Theory Group not found for enrollment");
    }

    const [attendances, theorySchedules, labSchedules, course] = await Promise.all([
      this.attendanceRepo.findByEnrollmentId(enrollmentIdVO),
      this.scheduleRepo.findByTheoryGroup(enrollment.theoryGroupId),
      enrollment.labGroupId
        ? this.scheduleRepo.findByLabGroup(enrollment.labGroupId)
        : Promise.resolve([]),
      this.courseRepo.findById(theoryGroup.courseId),
    ]);

    const courseName = course?.name ?? "Curso Desconocido";

    const allSchedules = [...theorySchedules, ...labSchedules];
    const classroomMap = new Map<string, string>();

    const uniqueClassroomIds = [...new Set(allSchedules.map(s => s.classroomId.value))];

    await Promise.all(
      uniqueClassroomIds.map(async (id) => {
        const room = await this.classroomRepo.findById(Id.create(id));
        if (room) classroomMap.set(id, room.name);
      })
    );

    const details: StudentAttendanceReportItemDto[] = attendances.map(att => {
      const dateDay = this.getDayOfWeekFromDate(att.date);

      const matchSchedule = allSchedules.find(s => {
        const isTheory = s.courseId !== null;
        const isLab = s.labGroupId !== null;

        const typeMatch =
          (att.classType === ClassType.THEORY && isTheory) ||
          (att.classType === ClassType.LAB && isLab);

        return typeMatch && s.timeSlot.day === dateDay;
      });

      const dateStr = att.date.toISOString().split("T")[0] ?? "N/A";

      return {
        date: dateStr,
        status: att.status,
        classType: att.classType,
        dayOfWeek: dateDay || "DESCONOCIDO",
        startTime: matchSchedule ? matchSchedule.timeSlot.startTime.value : "N/A",
        endTime: matchSchedule ? matchSchedule.timeSlot.endTime.value : "N/A",
        classroomName: matchSchedule
          ? classroomMap.get(matchSchedule.classroomId.value) ?? "Aula Desconocida"
          : "Sin Horario Fijo",
      };
    });

    details.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const total = details.length;
    const assists = details.filter(d => d.status === AttendanceStatus.PRESENT).length;
    const absences = total - assists;
    const percentage = total > 0 ? Math.round((assists / total) * 100) : 100;

    return {
      enrollmentId,
      courseName,
      totalAssists: assists,
      totalAbsences: absences,
      percentage,
      details,
    };
  }

  private getDayOfWeekFromDate(date: Date): DayOfWeek | null {
    const map: Record<number, DayOfWeek> = {
      0: DayOfWeek.SUNDAY,
      1: DayOfWeek.MONDAY,
      2: DayOfWeek.TUESDAY,
      3: DayOfWeek.WEDNESDAY,
      4: DayOfWeek.THURSDAY,
      5: DayOfWeek.FRIDAY,
      6: DayOfWeek.SATURDAY,
    };

    return map[date.getUTCDay()] ?? null;
  }
}

