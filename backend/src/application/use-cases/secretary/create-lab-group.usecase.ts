import { LabGroup } from "@/domain/entities/lab-group.entity.js";
import { ClassSchedule } from "@/domain/entities/class-schedule.entity.js";
import { type ILabGroupRepository, type IClassScheduleRepository, type ITheoryGroupRepository } from "@/domain/repositories/index.js";
import { Id, TimeSlot, AcademicSemester } from "@/domain/value-objects/index.js";
import { DayOfWeek } from "@/domain/enums/day-of-week.enum.js";
import { v4 as uuidv4 } from "uuid";

export interface CreateLabGroupScheduleDto {
  day: DayOfWeek;
  startTime: string;  // HH:MM format
  endTime: string;    // HH:MM format
  classroomId: string; // UUID of classroom
}

export interface CreateLabGroupDto {
  courseId: string;
  professorId: string;
  groupLetter: string;
  capacity: number;
  schedules: CreateLabGroupScheduleDto[]; // Array of schedules for the lab group
  semester: string; // Academic semester in format YYYY-I or YYYY-II
}

export class CreateLabGroupUseCase {
  constructor(
    private readonly labRepo: ILabGroupRepository,
    private readonly classScheduleRepo: IClassScheduleRepository,
    private readonly theoryGroupRepo: ITheoryGroupRepository
  ) {}

  public async execute(input: CreateLabGroupDto): Promise<void> {
    // Check if a lab group with the same letter already exists for this course
    const allLabGroups = await this.labRepo.findAll();
    const existingLabGroup = allLabGroups.find(
      lg => lg.courseId.value === input.courseId &&
            lg.groupLetter.value.toUpperCase() === input.groupLetter.toUpperCase()
    );

    if (existingLabGroup) {
      throw new Error(`Ya existe un laboratorio con la letra "${input.groupLetter}" para este curso.`);
    }

    // Ensure capacity is a proper number before passing to domain layer
    const numericCapacity = Number(input.capacity);

    // Validate capacity format before sending to domain layer
    if (isNaN(numericCapacity) || !Number.isInteger(numericCapacity) || numericCapacity <= 0 || numericCapacity > 50) {
        throw new Error(`Capacidad inválida: ${input.capacity}. Debe ser un entero positivo menor o igual a 50.`);
    }

    const labGroup = LabGroup.create({
      id: uuidv4(),
      courseId: input.courseId,
      professorId: input.professorId,
      groupLetter: input.groupLetter,
      capacity: numericCapacity,
      currentEnrollment: 0
    });

    // Check for professor schedule conflicts before saving
    const professorId = Id.create(input.professorId);
    const semester = AcademicSemester.create(input.semester);

    // Get all theory group schedules for this professor in this semester
    const theorySchedules = await this.theoryGroupRepo.findByProfessorAndSemester(professorId, semester);
    const theoryGroupIds = theorySchedules.map(tg => tg.id);
    const allTheorySchedules = [];

    // Get schedules for all theory groups assigned to this professor
    for (const groupId of theoryGroupIds) {
      const schedules = await this.classScheduleRepo.findByTheoryGroup(groupId);
      allTheorySchedules.push(...schedules);
    }

    // Get all lab group schedules for this professor in this semester
    const labSchedules = await this.labRepo.findByProfessor(professorId);
    const labGroupIds = labSchedules.map(lg => lg.id);
    const allLabSchedules = [];

    // Get schedules for all lab groups assigned to this professor
    for (const groupId of labGroupIds) {
      const schedules = await this.classScheduleRepo.findByLabGroup(groupId);
      allLabSchedules.push(...schedules);
    }

    // Check for conflicts with all professor's existing schedules
    const allProfessorSchedules = [...allTheorySchedules, ...allLabSchedules];

    for (const schedule of input.schedules) {
      // Create temporary TimeSlot to check for conflicts
      const newTimeSlot = TimeSlot.create({
        day: schedule.day,
        startTime: schedule.startTime,
        endTime: schedule.endTime
      });

      for (const existingSchedule of allProfessorSchedules) {
        if (existingSchedule.overlapsWith(newTimeSlot)) {
          throw new Error(`Conflicto de horario detectado: El profesor ya tiene asignatura en ${existingSchedule.timeSlot.day} ${existingSchedule.timeSlot.startTime.value}-${existingSchedule.timeSlot.endTime.value}`);
        }
      }
    }

    await this.labRepo.save(labGroup);

    // Create schedules for the lab group
    for (const schedule of input.schedules) {
      const classSchedule = ClassSchedule.create({
        id: uuidv4(),
        classroomId: schedule.classroomId,
        timeSlot: {
          day: schedule.day,
          startTime: schedule.startTime,
          endTime: schedule.endTime
        },
        semester: input.semester, // Use semester from input
        labGroupId: labGroup.id.value
      });

      await this.classScheduleRepo.save(classSchedule);
    }
  }
}
