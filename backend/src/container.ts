import "reflect-metadata";
import {
  type IUnitOfWork,
  type IRepositories,
} from "@/application/contracts/i-unit-of-work.js";
import { TypeormUnitOfWork } from "@/infraestructure/persistence/unit-of-work.js";

import { TeacherAuthorizationService } from "@/application/services/teacher-authorization.service.js";
import {
  GetStudentCoursesBySemesterUseCase,
  GetAvailableLabGroupsUseCase,
  GetStudentRosterWithGradesUseCase,
  GetStudentScheduleUseCase,
  GetStudentGradesBySemesterUseCase,
  GetTeacherGroupsUseCase,
  SaveBulkGradesUseCase,
  GetStudentRosterUseCase,
  TakeAttendanceUseCase,
  EnrollInLabGroupsUseCase,
  EnrollInLabGroupUseCase,
  GetTeacherScheduleUseCase,
  CreateRoomReservationUseCase,
  GetUserProfileUseCase,
  GetAllClassroomsUseCase,
  GetAllUsersUseCase,
} from "@/application/use-cases/index.js";

import { LoginUseCase } from "./application/use-cases/auth/login.usecase.js";
import { GetStudentCourseProgressUseCase } from "./application/use-cases/student/get-course-progress.usecase.js";
import { GetStudentAttendanceReportUseCase } from "./application/use-cases/student/get-student-attendance-report.usecase.js";

export interface AppContainer {
  repositories: IRepositories;
  useCases: {
    getStudentGrades: GetStudentGradesBySemesterUseCase;
    getStudentSchedule: GetStudentScheduleUseCase;
    getAvailableLabGroups: GetAvailableLabGroupsUseCase;
    enrollInLabGroup: EnrollInLabGroupUseCase;
    enrollInLabGroups: EnrollInLabGroupsUseCase;
    getStudentCourses: GetStudentCoursesBySemesterUseCase;
    takeAttendance: TakeAttendanceUseCase;
    getTeacherSchedule: GetTeacherScheduleUseCase;
    getStudentRoster: GetStudentRosterUseCase;
    getTeacherGroups: GetTeacherGroupsUseCase;
    getStudentRosterWithGrades: GetStudentRosterWithGradesUseCase;
    saveBulkGrades: SaveBulkGradesUseCase;
    login: LoginUseCase;
    createRoomReservation: CreateRoomReservationUseCase;
    getUserProfile: GetUserProfileUseCase;
    getAllClassrooms: GetAllClassroomsUseCase;
    getStudentCourseProgress: GetStudentCourseProgressUseCase;
    getStudentAttendanceReport: GetStudentAttendanceReportUseCase;
    getAllUsers: GetAllUsersUseCase;
  };
  unitOfWork: IUnitOfWork;
  authService: TeacherAuthorizationService;
}

function createContainer(): AppContainer {
  const unitOfWork = new TypeormUnitOfWork();
  const repositories = unitOfWork.repositories;

  const authService = new TeacherAuthorizationService();

  const useCases: AppContainer["useCases"] = {
    // Read
    getStudentGrades: new GetStudentGradesBySemesterUseCase(
      repositories.enrollment,
      repositories.grade,
    ),
    // Read
    getStudentSchedule: new GetStudentScheduleUseCase(
      repositories.enrollment,
      repositories.theoryGroup,
      repositories.labGroup,
      repositories.classSchedule,
      repositories.course,
      repositories.classroom,
      repositories.user,
    ),

    // Read
    getAvailableLabGroups: new GetAvailableLabGroupsUseCase(
      repositories.enrollment,
      repositories.theoryGroup,
      repositories.labGroup,
    ),

    // Read
    getStudentCourses: new GetStudentCoursesBySemesterUseCase(
      repositories.enrollment,
      repositories.theoryGroup,
      repositories.course,
      repositories.user,
    ),

    // Need UoW
    enrollInLabGroup: new EnrollInLabGroupUseCase(unitOfWork),
    enrollInLabGroups: new EnrollInLabGroupsUseCase(unitOfWork),

    // Don't need UoW
    getTeacherSchedule: new GetTeacherScheduleUseCase(
      repositories.theoryGroup,
      repositories.labGroup,
      repositories.classSchedule,
      repositories.course,
      repositories.classroom,
    ),
    getStudentRoster: new GetStudentRosterUseCase(
      repositories.enrollment,
      repositories.studentProfile,
      repositories.user,
      repositories.theoryGroup,
      repositories.labGroup,
      authService,
    ),
    getTeacherGroups: new GetTeacherGroupsUseCase(
      repositories.theoryGroup,
      repositories.labGroup,
      repositories.course,
      repositories.classSchedule,
    ),
    getStudentRosterWithGrades: new GetStudentRosterWithGradesUseCase(
      repositories.enrollment,
      repositories.studentProfile,
      repositories.user,
      repositories.theoryGroup,
      repositories.labGroup,
      repositories.grade,
      authService,
    ),

    // Teacher Use Cases (UoW and Auth)
    takeAttendance: new TakeAttendanceUseCase(unitOfWork, authService),
    saveBulkGrades: new SaveBulkGradesUseCase(unitOfWork, authService),

    login: new LoginUseCase(
      repositories.user,
      repositories.studentProfile,
      repositories.teacherProfile,
    ),
    createRoomReservation: new CreateRoomReservationUseCase(unitOfWork),
    getUserProfile: new GetUserProfileUseCase(repositories.user),
    getAllClassrooms: new GetAllClassroomsUseCase(repositories.classroom),
    getStudentCourseProgress: new GetStudentCourseProgressUseCase(
      repositories.courseContent
    ),
    getStudentAttendanceReport: new GetStudentAttendanceReportUseCase(
      repositories.enrollment,
      repositories.attendance,
      repositories.classSchedule,
      repositories.classroom,
      repositories.course,
      repositories.theoryGroup
    ),
    getAllUsers: new GetAllUsersUseCase(
      repositories.user
    )
  };

  return {
    repositories,
    useCases,
    unitOfWork,
    authService,
  };
}

// Singleton instance
export const container = createContainer();
