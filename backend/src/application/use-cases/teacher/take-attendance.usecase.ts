import { Id } from "@/domain/value-objects/index.js";
import { Attendance } from "@/domain/entities/attendance.entity.js";
import { type Enrollment } from "@/domain/entities/enrollment.entity.js";
import { ClassType } from "@/domain/enums/index.js";
import { type TakeAttendanceDto } from "@/application/dtos/attendance.dto.js";
import { NotAuthorizedError } from "@/application/errors/not-authorized.error.js";
import { EnrollmentNotFoundError } from "@/domain/errors/index.js";
import { v4 as uuidv4 } from "uuid";
import { type IUnitOfWork } from "@/application/contracts/i-unit-of-work.js";
import type { TeacherAuthorizationService } from "@/application/services/teacher-authorization.service.js";

/**
 * Use Case: A teacher marks attendance for a theory or lab session.
 *
 * This operation is atomic: all validations and persistence happen
 * within a single transaction provided by the Unit of Work.
 */
export class TakeAttendanceUseCase {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly authService: TeacherAuthorizationService,
  ) {}

  /**
   * Executes the attendance marking process.
   * @param input DTO containing teacher, group, date, and records.
   */
  public async execute(input: TakeAttendanceDto): Promise<void> {
    const teacherIdVO = Id.create(input.teacherUserId);
    const groupIdVO = Id.create(input.groupId);
    const date = new Date(input.date);

    await this.uow.execute(async (repos) => {
      // Authorize
      await this.authService.authorizeTeacherForGroup(
        teacherIdVO,
        groupIdVO,
        input.classType,
        repos.theoryGroup,
        repos.labGroup,
      );

      const enrollmentIdsVO = input.records.map((r) =>
        Id.create(r.enrollmentId),
      );

      // Load
      const [enrollments, existingAttendances] = await Promise.all([
        repos.enrollment.findByIds(enrollmentIdsVO),
        repos.attendance.findManyByEnrollmentsDateAndType(
          enrollmentIdsVO,
          date,
          input.classType,
        ),
      ]);

      const attendancesToSave: Attendance[] = [];

      // Build
      const enrollmentsMap = new Map(enrollments.map((e) => [e.id.value, e]));
      const existingMap = new Map(
        existingAttendances.map((a) => [a.enrollmentId.value, a]),
      );

      // Process
      for (const record of input.records) {
        const enrollment = enrollmentsMap.get(record.enrollmentId);

        if (!enrollment) {
          throw new EnrollmentNotFoundError(record.enrollmentId);
        }

        this.validateEnrollmentGroup(enrollment, groupIdVO, input.classType);

        const existing = existingMap.get(record.enrollmentId);

        if (existing) {
          existing.updateStatus(record.status);
          attendancesToSave.push(existing);
        } else {
          const newAttendance = Attendance.create({
            id: uuidv4(),
            enrollmentId: record.enrollmentId,
            date,
            status: record.status,
            classType: input.classType,
          });
          attendancesToSave.push(newAttendance);
        }
      }

      await repos.attendance.saveMany(attendancesToSave);
    });
  }

  /**
   * Validates that an enrollment belongs to the specified theory or lab group.
   * @param enrollment The enrollment entity
   * @param groupId The target group ID
   * @param classType Theory or Lab
   */
  private validateEnrollmentGroup(
    enrollment: Enrollment,
    groupId: Id,
    classType: ClassType,
  ): void {
    const theoryId = enrollment.theoryGroupId.value;
    const labId = enrollment.labGroupId?.value;

    if (classType === ClassType.THEORY && theoryId !== groupId.value) {
      throw new NotAuthorizedError(
        `Enrollment ${enrollment.id.value} does not belong to this theory group.`,
      );
    }

    if (classType === ClassType.LAB && labId !== groupId.value) {
      throw new NotAuthorizedError(
        `Enrollment ${enrollment.id.value} does not belong to this lab group.`,
      );
    }
  }
}
