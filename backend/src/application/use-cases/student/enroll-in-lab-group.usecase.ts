import { Id } from "@/domain/value-objects/index.js";
import {
  CourseMismatchError,
  EnrollmentNotFoundError,
  StudentAlreadyEnrolledInLabError,
} from "@/domain/errors/enrollment.errors.js";
import {
  LabGroupFullError,
  LabGroupNotFoundError,
} from "@/domain/errors/lab.errors.js";
import { NotAuthorizedError } from "@/application/errors/not-authorized.error.js";
import { ScheduleConflictError } from "@/domain/errors/index.js";
import { type IUnitOfWork } from "@/application/contracts/i-unit-of-work.js";
import { type ISystemConfigRepository } from "@/domain/repositories/isystem-config.repository.js";
import { OutsideEnrollmentPeriodError } from "@/application/errors/outside-enrollment-period.error.js";

export interface EnrollInLabGroupInput {
  studentProfileId: string;
  enrollmentId: string;
  labGroupId: string;
}

export class EnrollInLabGroupUseCase {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly systemConfigRepo: ISystemConfigRepository,
  ) { }

  public async execute(input: EnrollInLabGroupInput): Promise<void> {
    const studentIdVO = Id.create(input.studentProfileId);
    const enrollmentIdVO = Id.create(input.enrollmentId);
    const labGroupIdVO = Id.create(input.labGroupId);

    // First check if we're within the enrollment period
    await this.validateEnrollmentPeriod();

    await this.uow.execute(async (repos) => {

      const enrollment = await repos.enrollment.findById(enrollmentIdVO);
      if (!enrollment) throw new EnrollmentNotFoundError(input.enrollmentId);

      if (!enrollment.studentId.equals(studentIdVO))
        throw new NotAuthorizedError();

      if (enrollment.labGroupId) throw new StudentAlreadyEnrolledInLabError();

      const labGroup = await repos.labGroup.findById(labGroupIdVO);
      if (!labGroup) throw new LabGroupNotFoundError(input.labGroupId);

      if (labGroup.isFull()) throw new LabGroupFullError();

      const theoryGroup = await repos.theoryGroup.findById(enrollment.theoryGroupId);
      if (!theoryGroup || !theoryGroup.courseId.equals(labGroup.courseId)) {
        throw new CourseMismatchError();
      }

      const newLabSchedules = await repos.classSchedule.findByLabGroup(labGroupIdVO);
      const currentSchedules = await repos.enrollment.findStudentSchedules(studentIdVO);

      for (const newSch of newLabSchedules) {
        for (const currSch of currentSchedules) {

          if (newSch.semester.equals(currSch.semester)) {
            if (newSch.overlapsWith(currSch.timeSlot)) {
              throw new ScheduleConflictError(
                `El horario del laboratorio se cruza con otra clase registrada (${currSch.timeSlot.day} ${currSch.timeSlot.startTime} - ${currSch.timeSlot.endTime})`
              );
            }
          }
        }
      }


      labGroup.incrementEnrollment();
      enrollment.assignLab(labGroup.id);

      await repos.labGroup.save(labGroup);
      await repos.enrollment.save(enrollment);
    });
  }

  private async validateEnrollmentPeriod(): Promise<void> {
    const startDateStr = await this.systemConfigRepo.get("LAB_ENROLLMENT_START_DATE");
    const endDateStr = await this.systemConfigRepo.get("LAB_ENROLLMENT_END_DATE");

    // If no enrollment period is defined, enrollment is not allowed
    if (!startDateStr || !endDateStr) {
      throw new OutsideEnrollmentPeriodError(
        "No hay un periodo de matrícula en laboratorios definido. La matrícula no está permitida."
      );
    }

    const now = new Date();
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    // Normalize dates to compare only the date part (without time) using UTC
    const normalizeDate = (date: Date) => {
      const normalized = new Date(date);
      normalized.setUTCHours(0, 0, 0, 0);
      return normalized;
    };

    const nowNormalized = normalizeDate(now);
    const startNormalized = normalizeDate(startDate);
    const endNormalized = normalizeDate(endDate);

    if (nowNormalized < startNormalized || nowNormalized > endNormalized) {
      throw new OutsideEnrollmentPeriodError(
        `La matrícula en laboratorios solo está permitida entre ${startDateStr} y ${endDateStr}`
      );
    }
  }
}
