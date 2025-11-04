import {
  type IEnrollmentRepository,
  type IStudentProfileRepository,
  type IUserRepository,
  type ITheoryGroupRepository,
  type ILabGroupRepository,
  type IGradeRepository,
} from "@/domain/repositories/index.js";
import { Id } from "@/domain/value-objects/index.js";
import {
  type StudentRosterWithGradesDto,
  type StudentGradeEntry,
} from "@/application/dtos/student.dto.js";
import { ClassType, GradeType } from "@/domain/enums/index.js";
import type { Enrollment } from "@/domain/entities/enrollment.entity.js";
import type { Grade } from "@/domain/entities/grade.entity.js";
import { type TeacherAuthorizationService } from "@/application/services/teacher-authorization.service.js";

export class GetStudentRosterWithGradesUseCase {
  constructor(
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly studentProfileRepository: IStudentProfileRepository,
    private readonly userRepository: IUserRepository,
    private readonly theoryGroupRepository: ITheoryGroupRepository,
    private readonly labGroupRepository: ILabGroupRepository,
    private readonly gradeRepository: IGradeRepository,
    private readonly authService: TeacherAuthorizationService,
  ) {}

  public async execute(
    teacherUserId: string,
    groupId: string,
    classType: ClassType,
  ): Promise<StudentRosterWithGradesDto[]> {
    const teacherIdVO = Id.create(teacherUserId);
    const groupIdVO = Id.create(groupId);

    await this.authService.authorizeTeacherForGroup(
      teacherIdVO,
      groupIdVO,
      classType,
      this.theoryGroupRepository,
      this.labGroupRepository,
    );

    let enrollments: Enrollment[] = [];
    if (classType === ClassType.THEORY) {
      enrollments =
        await this.enrollmentRepository.findByTheoryGroup(groupIdVO);
    } else {
      enrollments = await this.enrollmentRepository.findByLabGroup(groupIdVO);
    }
    if (!enrollments.length) return [];

    const profileIds = enrollments.map((e) => e.studentId);
    const profiles = await this.studentProfileRepository.findByIds(profileIds);
    const profileMap = new Map(profiles.map((p) => [p.id.value, p]));

    const userIds = profiles.map((p) => p.userId);
    const users = await this.userRepository.findByIds(userIds);
    const userMap = new Map(users.map((u) => [u.id.value, u]));

    const roster: StudentRosterWithGradesDto[] = [];
    for (const enrollment of enrollments) {
      const profile = profileMap.get(enrollment.studentId.value);
      if (!profile) continue;
      const user = userMap.get(profile.userId.value);
      if (!user) continue;

      const grades = await this.gradeRepository.findByEnrollmentId(
        enrollment.id,
      );

      roster.push({
        enrollmentId: enrollment.id.value,
        studentCode: profile.studentCode.value,
        name: user.name,
        surname: user.surname,
        email: user.email.value,
        grades: this.mapGradesToGrid(grades),
      });
    }
    return roster;
  }

  private mapGradesToGrid(studentGrades: Grade[]): StudentGradeEntry[] {
    const gradeMap = new Map(studentGrades.map((g) => [g.type, g.score.value]));
    return Object.values(GradeType).map((type) => ({
      type,
      score: gradeMap.get(type) ?? null,
    }));
  }
}
