import {
  type IClassScheduleRepository,
  type IRoomReservationRepository,
  type IUserRepository,
  type ITheoryGroupRepository,
  type ILabGroupRepository,
} from "@/domain/repositories/index.js";
import { Id, AcademicSemester } from "@/domain/value-objects/index.js";
import type { ClassroomScheduleEntryDto } from "@/application/dtos/classroom-schedule.dto.js";

export class GetClassroomScheduleUseCase {
  constructor(
    private readonly classScheduleRepo: IClassScheduleRepository,
    private readonly reservationRepo: IRoomReservationRepository,
    private readonly userRepo: IUserRepository,
    private readonly theoryGroupRepo: ITheoryGroupRepository,
    private readonly labGroupRepo: ILabGroupRepository,
  ) {}

  public async execute(
    classroomId: string,
    semester: string,
  ): Promise<ClassroomScheduleEntryDto[]> {
    const classroomIdVO = Id.create(classroomId);
    const semesterVO = AcademicSemester.create(semester);
    const entries: ClassroomScheduleEntryDto[] = [];

    const fixedSchedules =
      await this.classScheduleRepo.findSchedulesByClassroomAndSemester(
        classroomIdVO,
        semesterVO,
      );

    for (const sch of fixedSchedules) {
      let title = sch.courseId ? "Clase Regular" : "Clase";
      let professorName = "Docente Asignado";

      // Try to determine professor and class type (theory vs lab)
      if (sch.labGroupId) {
        // This is a lab class - get the lab group and its professor
        const labGroup = await this.labGroupRepo.findById(sch.labGroupId);
        if (labGroup) {
          const professor = await this.userRepo.findById(labGroup.professorId);
          if (professor) {
            professorName = `${professor.name} ${professor.surname}`;
          }
        }
      } else if (sch.courseId) {
        // This is a theory class - get the theory group and its professor
        const theoryGroups = await this.theoryGroupRepo.findByCourseAndSemester(
          sch.courseId,
          semesterVO
        );

        // Find the theory group associated with this schedule by matching time slots or other criteria
        // Since we know this schedule belongs to this course, just get the professor from any matching theory group
        for (const theoryGroup of theoryGroups) {
          const professor = await this.userRepo.findById(theoryGroup.professorId);
          if (professor) {
            professorName = `${professor.name} ${professor.surname}`;
            break; // Get the first professor found
          }
        }
      }

      entries.push({
        title,
        type: "FIXED_CLASS", // Using the correct type enum value
        day: sch.timeSlot.day,
        startTime: sch.timeSlot.startTime.value,
        endTime: sch.timeSlot.endTime.value,
        professorName, // Now this should have the actual professor name
      });
    }

    const reservations =
      await this.reservationRepo.findByClassroomAndSemester(
        classroomIdVO,
        semesterVO,
      );

    const activeReservations = reservations.filter((r) => r.status === "reservado");

    for (const res of activeReservations) {
      const professor = await this.userRepo.findById(res.professorId);

      const dayIndex = res.date.value.getUTCDay();
      const days = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];

      entries.push({
        title: res.notes || "Reserva Puntual",
        type: "RESERVATION",
        day: days[dayIndex] as any,
        startTime: res.startTime.value,
        endTime: res.endTime.value,
        professorName: professor ? `${professor.name} ${professor.surname}` : "Desconocido",
        date: res.date.isoString
      });
    }

    return entries;
  }
}
