import type {
  IEnrollmentRepository,
  ILabGroupRepository,
  ITheoryGroupRepository,
  IGradeRepository,
  IAttendanceRepository,
  IStudentProfileRepository,
  ITeacherProfileRepository,
  IUserRepository,
  ICourseRepository,
  IClassroomRepository,
  IClassScheduleRepository,
  IRoomReservationRepository,
  ICourseContentRepository,
  IGradeWeightRepository,
} from "@/domain/repositories/index.js";

/**
 * Defines all repositories that can participate in a single atomic transaction.
 */
export interface ITransactionalRepositories {
  enrollment: IEnrollmentRepository;
  labGroup: ILabGroupRepository;
  theoryGroup: ITheoryGroupRepository;
  grade: IGradeRepository;
  attendance: IAttendanceRepository;
  roomReservation: IRoomReservationRepository;
  classSchedule: IClassScheduleRepository;
  // Add additional transactional repositories here if needed
}

/**
 * Defines all repositories in the system, both transactional and non-transactional.
 */
export interface IRepositories extends ITransactionalRepositories {
  studentProfile: IStudentProfileRepository;
  teacherProfile: ITeacherProfileRepository;
  user: IUserRepository;
  course: ICourseRepository;
  classroom: IClassroomRepository;
  classSchedule: IClassScheduleRepository;
  roomReservation: IRoomReservationRepository;
  courseContent: ICourseContentRepository;
  gradeWeight: IGradeWeightRepository;
}

/**
 * Interface for the Unit of Work pattern.
 * Allows Use Cases to perform operations in a transaction without
 * depending on TypeORM or any specific infrastructure library.
 */
export interface IUnitOfWork {
  /**
   * Provides access to all repositories (non-transactional ones included).
   */
  readonly repositories: IRepositories;

  /**
   * Executes a callback function within a transaction.
   * - If the callback throws, the transaction is rolled back.
   * - If the callback completes successfully, the transaction is committed.
   *
   * @param work - A callback function that receives the transactional repositories.
   * @returns The result of the callback.
   */
  execute<T>(
    work: (repos: ITransactionalRepositories) => Promise<T>,
  ): Promise<T>;
}
