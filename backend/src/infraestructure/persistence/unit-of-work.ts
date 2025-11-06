import { type EntityManager } from "typeorm";
import {
  type IUnitOfWork,
  type ITransactionalRepositories,
  type IRepositories,
} from "@/application/contracts/i-unit-of-work.js";
import { AppDataSource } from "./database.config.js";

// Import all repository implementations
import {
  TypeormEnrollmentRepository,
  TypeormLabGroupRepository,
  TypeormTheoryGroupRepository,
  TypeormGradeRepository,
  TypeormAttendanceRepository,
  TypeormStudentProfileRepository,
  TypeormTeacherProfileRepository,
  TypeormUserRepository,
  TypeormCourseRepository,
  TypeormClassroomRepository,
  TypeormClassScheduleRepository,
  TypeormRoomReservationRepository,
  TypeormCourseContentRepository,
  TypeormGradeWeightRepository,
} from "./repositories/index.js";

/**
 * TypeORM implementation of the Unit of Work pattern.
 * Allows executing multiple repository operations inside a single transaction.
 */
export class TypeormUnitOfWork implements IUnitOfWork {
  /**
   * Non-transactional repository instances (singleton).
   * These can be used outside transactions.
   */
  public readonly repositories: IRepositories;

  constructor() {
    // Initialize all repositories with the global connection
    this.repositories = {
      enrollment: new TypeormEnrollmentRepository(),
      labGroup: new TypeormLabGroupRepository(),
      theoryGroup: new TypeormTheoryGroupRepository(),
      grade: new TypeormGradeRepository(),
      attendance: new TypeormAttendanceRepository(),
      studentProfile: new TypeormStudentProfileRepository(),
      teacherProfile: new TypeormTeacherProfileRepository(),
      user: new TypeormUserRepository(),
      course: new TypeormCourseRepository(),
      classroom: new TypeormClassroomRepository(),
      classSchedule: new TypeormClassScheduleRepository(),
      roomReservation: new TypeormRoomReservationRepository(),
      courseContent: new TypeormCourseContentRepository(),
      gradeWeight: new TypeormGradeWeightRepository(),
    };
  }

  /**
   * Executes a unit of work inside a TypeORM transaction.
   * If the callback throws, the transaction is rolled back.
   * If the callback completes successfully, the transaction is committed.
   *
   * @param work - A callback receiving transactional repositories
   *               tied to this transaction.
   * @returns The result of the callback.
   */
  public async execute<T>(
    work: (repos: ITransactionalRepositories) => Promise<T>,
  ): Promise<T> {
    return AppDataSource.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        // Create transactional repository instances bound to this transaction
        const transactionalRepositories: ITransactionalRepositories = {
          enrollment: new TypeormEnrollmentRepository(
            transactionalEntityManager,
          ),
          labGroup: new TypeormLabGroupRepository(transactionalEntityManager),
          theoryGroup: new TypeormTheoryGroupRepository(
            transactionalEntityManager,
          ),
          grade: new TypeormGradeRepository(transactionalEntityManager),
          attendance: new TypeormAttendanceRepository(
            transactionalEntityManager,
          ),
          roomReservation: new TypeormRoomReservationRepository(
            transactionalEntityManager,
          ),
          classSchedule: new TypeormClassScheduleRepository(
            transactionalEntityManager,
          ),
        };

        // Execute the business logic inside the transaction
        return work(transactionalRepositories);
      },
    );
  }
}
