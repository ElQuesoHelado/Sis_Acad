import {
  type IClassScheduleRepository,
  type IRoomReservationRepository,
  type IUserRepository,
} from "@/domain/repositories/index.js";
import { Id, AcademicSemester } from "@/domain/value-objects/index.js";
import type { ClassroomScheduleEntryDto } from "@/application/dtos/classroom-schedule.dto.js";

export class GetClassroomScheduleUseCase {
  constructor(
    private readonly classScheduleRepo: IClassScheduleRepository,
    private readonly reservationRepo: IRoomReservationRepository,
    private readonly userRepo: IUserRepository,
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
      let title = "Clase";

      if (sch.courseId) {
         title = "Clase Regular"; 
      }
      
      entries.push({
        title,
        type: "FIXED_CLASS",
        day: sch.timeSlot.day,
        startTime: sch.timeSlot.startTime.value,
        endTime: sch.timeSlot.endTime.value,
        professorName: "Docente Asignado",
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
