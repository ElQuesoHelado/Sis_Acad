/**
 * @file TypeORM implementation of the Enrollment repository.
 */

import type { EntityManager } from "typeorm";
import { In, type Repository } from "typeorm";
import { ClassSchedule, Enrollment } from "@/domain/entities/index.js";
import { type IEnrollmentRepository, type StudentEnrollmentDetail } from "@/domain/repositories/ienrollment.repository.js";
import { EnrollmentModel } from "../models/enrollment.model.js";
import type { AcademicSemester, Id } from "@/domain/value-objects/index.js";
import { AppDataSource } from "../database.config.js";
import type { GradeModel } from "../models/grade.model.js";
import { Grade } from "@/domain/entities/grade.entity.js";
import { GradeWeight } from "@/domain/entities/grade-weight.entity.js";
import type { GradeWeightModel } from "../models/grade-weight.model.js";
import { ClassScheduleModel } from "../models/class-schedule.model.js";

/**
 * Repository implementation for Enrollment using TypeORM.
 */
export class TypeormEnrollmentRepository implements IEnrollmentRepository {
  private ormRepo: Repository<EnrollmentModel>;

  constructor(manager?: EntityManager) {
    const repository = manager ?? AppDataSource;
    this.ormRepo = repository.getRepository(EnrollmentModel);
  }

  /**
   * Maps a TypeORM model to a domain Enrollment entity.
   * @param model - The database model.
   * @returns The domain entity.
   */
  private toDomain = (model: EnrollmentModel): Enrollment => {
    return Enrollment.create({
      id: model.id,
      studentId: model.studentId,
      theoryGroupId: model.theoryGroupId,
      labGroupId: model.labGroupId,
    });
  };

  /**
   * Maps a domain Enrollment entity to a plain object for persistence.
   * @param entity - The domain entity.
   * @returns A plain object suitable for TypeORM.
   */
  private toPersistence(entity: Enrollment) {
    return {
      id: entity.id.value,
      studentId: entity.studentId.value,
      theoryGroupId: entity.theoryGroupId.value,
      labGroupId: entity.labGroupId ? entity.labGroupId.value : null,
    };
  }

  /** Finds an Enrollment by its ID. */
  public async findById(id: Id): Promise<Enrollment | null> {
    const model = await this.ormRepo.findOneBy({ id: id.value });
    return model ? this.toDomain(model) : null;
  }

  /** Finds multiple Enrollments by their IDs. */
  public async findByIds(ids: Id[]): Promise<Enrollment[]> {
    const idValues = ids.map((id) => id.value);
    const models = await this.ormRepo.findBy({
      id: In(idValues),
    });
    return models.map(this.toDomain);
  }

  /** Finds an Enrollment by student ID and TheoryGroup ID. */
  public async findByStudentAndTheoryGroup(
    studentId: Id,
    theoryGroupId: Id,
  ): Promise<Enrollment | null> {
    const model = await this.ormRepo.findOneBy({
      studentId: studentId.value,
      theoryGroupId: theoryGroupId.value,
    });
    return model ? this.toDomain(model) : null;
  }

  /** Finds all Enrollments for a specific student. */
  public async findByStudent(studentId: Id): Promise<Enrollment[]> {
    const models = await this.ormRepo.findBy({ studentId: studentId.value });
    return models.map(this.toDomain);
  }

  /** Finds all Enrollments for a specific TheoryGroup. */
  public async findByTheoryGroup(theoryGroupId: Id): Promise<Enrollment[]> {
    const models = await this.ormRepo.findBy({
      theoryGroupId: theoryGroupId.value,
    });
    return models.map(this.toDomain);
  }

  /** Finds all Enrollments for a specific LabGroup. */
  public async findByLabGroup(labGroupId: Id): Promise<Enrollment[]> {
    const models = await this.ormRepo.findBy({
      labGroupId: labGroupId.value,
    });
    return models.map(this.toDomain);
  }

  /** Saves (creates or updates) an Enrollment. */
  public async save(enrollment: Enrollment): Promise<void> {
    const persistenceData = this.toPersistence(enrollment);
    await this.ormRepo.save(persistenceData);
  }

  /** Deletes an Enrollment by its ID. */
  public async delete(id: Id): Promise<void> {
    await this.ormRepo.delete({ id: id.value });
  }

  /**
   * Retrieves detailed enrollment information for a student within a specific semester.
   * Includes Course, Professor, Grades, and Grade Weights in a single aggregated structure.
   */
  public async findStudentSemesterDetails(
    studentId: Id,
    semester: AcademicSemester
  ): Promise<StudentEnrollmentDetail[]> {
    const models = await this.ormRepo.find({
      where: {
        studentId: studentId.value,
        theoryGroup: {
          semester: semester as any
        }
      },
      relations: [
        "theoryGroup",
        "theoryGroup.course",
        "theoryGroup.professor",
        "theoryGroup.gradeWeights",
        "grades"
      ]
    });

    return models.map((model) => {
      const group = model.theoryGroup;

      // Map the base Enrollment entity
      const enrollment = this.toDomain(model);

      // Map Grades using the domain factory
      // Note: score is stored as Decimal (string) in the DB, so we convert it to Number
      const grades = (model.grades || []).map((g: GradeModel) =>
        Grade.create({
          id: g.id,
          enrollmentId: g.enrollmentId,
          type: g.type,
          score: Number(g.score)
        })
      );

      // Map Grade Weights using the domain factory
      const weights = (group.gradeWeights || []).map((w: GradeWeightModel) =>
        GradeWeight.create({
          id: w.id,
          theoryGroupId: w.theoryGroupId,
          type: w.type,
          weight: Number(w.weight)
        })
      );

      return {
        enrollment,
        theoryGroupId: group.id,
        courseName: group.course.name,
        professorName: `${group.professor.name} ${group.professor.surname}`,
        grades,
        weights
      };
    });
  }

  public async findByGroupId(groupId: Id): Promise<Enrollment[]> {
    const models = await this.ormRepo.find({
      where: [
        { theoryGroupId: groupId.value },
        { labGroupId: groupId.value },
      ],
    });
    return models.map(this.toDomain);
  }

  public async findStudentSchedules(studentId: Id): Promise<ClassSchedule[]> {
    const enrollments = await this.ormRepo.findBy({ studentId: studentId.value });
    if (enrollments.length === 0) return [];

    const theoryGroupIds = enrollments.map(e => e.theoryGroupId);
    const labGroupIds = enrollments
      .map(e => e.labGroupId)
      .filter((id): id is string => id !== null);

    if (theoryGroupIds.length === 0 && labGroupIds.length === 0) return [];

    const scheduleRepo = AppDataSource.getRepository(ClassScheduleModel);

    const schedules = await scheduleRepo.createQueryBuilder("schedule")
      .where("schedule.theoryGroupId IN (:...theoryIds)", { theoryIds: theoryGroupIds.length ? theoryGroupIds : [''] })
      .orWhere("schedule.labGroupId IN (:...labIds)", { labIds: labGroupIds.length ? labGroupIds : [''] })
      .getMany();

    return schedules.map(model => {
      return ClassSchedule.create({
        id: model.id,
        classroomId: model.classroomId,
        semester: model.semester.value,
        timeSlot: {
          day: model.day,
          startTime: model.startTime.value,
          endTime: model.endTime.value
        },
        courseId: null,
        labGroupId: model.labGroupId
      });
    });
  }
}
