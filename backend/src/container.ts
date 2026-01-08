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
  GetAdminTeacherDetailsUseCase,
  GetAdminStudentDetailsUseCase,
} from "@/application/use-cases/index.js";

import { LoginUseCase } from "./application/use-cases/auth/login.usecase.js";
import { GetStudentCourseProgressUseCase } from "./application/use-cases/student/get-course-progress.usecase.js";
import { GetStudentAttendanceReportUseCase } from "./application/use-cases/student/get-student-attendance-report.usecase.js";
import { GetClassroomScheduleUseCase } from "./application/use-cases/classroom/get-classroom-schedule.usecase.js";
import { GetAccreditationDashboardUseCase } from "./application/use-cases/teacher/get-accreditation-dashboard.usecase.js";
import { SaveGroupEvidenceUseCase } from "./application/use-cases/teacher/save-group-evidence.usecase.js";
import { TypeormGroupPortfolioRepository } from "./infraestructure/persistence/repositories/typeorm-group-portfolio.repository.js";
import { UpdateTopicStatusUseCase } from "./application/use-cases/teacher/update-topic-status.usecase.js";
import { GetCourseContentByGroupUseCase } from "./application/use-cases/teacher/get-course-content.usecase.js";
import { CreateLabGroupUseCase } from "./application/use-cases/secretary/create-lab-group.usecase.js";
import { GetAllLabGroupsUseCase } from "./application/use-cases/secretary/get-all-lab-groups.usecase.js";
import { GetStudentsInLabUseCase } from "./application/use-cases/secretary/get-students-in-lab.usecase.js";
import { ManageEnrollmentDeadlineUseCase } from "./application/use-cases/secretary/manage-enrollment-deadline.usecase.js";
import { GetAllLabGroupsWithSchedulesUseCase } from "./application/use-cases/admin/get-all-lab-groups-with-schedules.usecase.js";
import { UpdateLabGroupCapacityUseCase } from "./application/use-cases/secretary/update-lab-group-capacity.usecase.js";
import { GetAllCoursesUseCase } from "./application/use-cases/admin/get-all-courses.usecase.js";

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
    getAdminTeacherDetails: GetAdminTeacherDetailsUseCase;
    getAdminStudentDetails: GetAdminStudentDetailsUseCase;
    getClassroomSchedule: GetClassroomScheduleUseCase;
    getAccreditationDashboard: GetAccreditationDashboardUseCase;
    saveGroupEvidence: SaveGroupEvidenceUseCase;
    getCourseContent: GetCourseContentByGroupUseCase;
    updateTopicStatus: UpdateTopicStatusUseCase;
    createLabGroup: CreateLabGroupUseCase;
    updateLabGroupCapacity: UpdateLabGroupCapacityUseCase;
    manageEnrollmentDeadline: ManageEnrollmentDeadlineUseCase;
    getAllLabGroups: GetAllLabGroupsUseCase;
    getStudentsInLab: GetStudentsInLabUseCase;
    getAllLabGroupsWithSchedules: GetAllLabGroupsWithSchedulesUseCase;
    getAllCourses: GetAllCoursesUseCase;
  };
  unitOfWork: IUnitOfWork;
  authService: TeacherAuthorizationService;
}

function createContainer(): AppContainer {
  const unitOfWork = new TypeormUnitOfWork();
  const repositories = unitOfWork.repositories;

  const authService = new TeacherAuthorizationService();

  const groupPortfolioRepo = new TypeormGroupPortfolioRepository();

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
      repositories.classSchedule,
      repositories.classroom
    ),

    // Read
    getStudentCourses: new GetStudentCoursesBySemesterUseCase(
      repositories.enrollment,
      repositories.theoryGroup,
      repositories.course,
      repositories.user,
    ),

    // Need UoW
    enrollInLabGroup: new EnrollInLabGroupUseCase(unitOfWork, repositories.systemConfig),
    enrollInLabGroups: new EnrollInLabGroupsUseCase(unitOfWork, repositories.systemConfig),

    // Don't need UoW
    getTeacherSchedule: new GetTeacherScheduleUseCase(
      repositories.theoryGroup,
      repositories.labGroup,
      repositories.classSchedule,
      repositories.course,
      repositories.classroom,
      repositories.roomReservation,
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
      repositories.courseContent,
      groupPortfolioRepo,
      repositories.enrollment
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
    ),
    getAdminTeacherDetails: new GetAdminTeacherDetailsUseCase(
      repositories.teacherProfile,
      repositories.theoryGroup,
      repositories.labGroup,
      repositories.classSchedule,
      repositories.course,
      repositories.classroom
    ),

    getAdminStudentDetails: new GetAdminStudentDetailsUseCase(
      repositories.studentProfile,
      repositories.enrollment,
      repositories.grade
    ),

    getClassroomSchedule: new GetClassroomScheduleUseCase(
      repositories.classSchedule,
      repositories.roomReservation,
      repositories.user,
      repositories.theoryGroup,
      repositories.labGroup,
    ),
    getAccreditationDashboard: new GetAccreditationDashboardUseCase(
      repositories.enrollment,
      repositories.grade,
      groupPortfolioRepo,
      repositories.gradeWeight
    ),
    saveGroupEvidence: new SaveGroupEvidenceUseCase(groupPortfolioRepo),

    getCourseContent: new GetCourseContentByGroupUseCase(
      repositories.courseContent,
      repositories.theoryGroup
    ),

    updateTopicStatus: new UpdateTopicStatusUseCase(
      repositories.courseContent
    ),


    createLabGroup: new CreateLabGroupUseCase(repositories.labGroup, repositories.classSchedule, repositories.theoryGroup),
    updateLabGroupCapacity: new UpdateLabGroupCapacityUseCase(repositories.labGroup),
    manageEnrollmentDeadline: new ManageEnrollmentDeadlineUseCase(repositories.systemConfig),
    getAllLabGroups: new GetAllLabGroupsUseCase(repositories.labGroup, repositories.classSchedule, repositories.classroom),
    getStudentsInLab: new GetStudentsInLabUseCase(repositories.enrollment, repositories.labGroup, repositories.studentProfile, repositories.user),
    getAllLabGroupsWithSchedules: new GetAllLabGroupsWithSchedulesUseCase(
      repositories.labGroup,
      repositories.classSchedule,
      repositories.course,
      repositories.classroom,
      repositories.user
    ),
    getAllCourses: new GetAllCoursesUseCase(repositories.course),
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
