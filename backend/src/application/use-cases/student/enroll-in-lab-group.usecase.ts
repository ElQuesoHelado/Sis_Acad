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

export interface EnrollInLabGroupInput {
  studentProfileId: string;
  enrollmentId: string;
  labGroupId: string;
}

export class EnrollInLabGroupUseCase {
  constructor(private readonly uow: IUnitOfWork) { }

  public async execute(input: EnrollInLabGroupInput): Promise<void> {
    const studentIdVO = Id.create(input.studentProfileId);
    const enrollmentIdVO = Id.create(input.enrollmentId);
    const labGroupIdVO = Id.create(input.labGroupId);

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
}
