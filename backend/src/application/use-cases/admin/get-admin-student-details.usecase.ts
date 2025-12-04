import {
  type IStudentProfileRepository,
  type IEnrollmentRepository,
  type IGradeRepository,
} from "@/domain/repositories/index.js";
import { Id, AcademicSemester } from "@/domain/value-objects/index.js";
import { type StudentCourseGradesDto } from "@/application/dtos/student-grades.dto.js";

import { toGradeOutputDto } from "@/application/mappers/grade.mapper.js"; 

export class GetAdminStudentDetailsUseCase {
  constructor(
    private readonly studentProfileRepo: IStudentProfileRepository,
    private readonly enrollmentRepo: IEnrollmentRepository,
    private readonly gradeRepo: IGradeRepository
  ) {}

  public async execute(
    userId: string,
    semester: string
  ): Promise<StudentCourseGradesDto[]> {
    const userIdVO = Id.create(userId);
    const semesterVO = AcademicSemester.create(semester);

    const profile = await this.studentProfileRepo.findByUserId(userIdVO);
    if (!profile) {
      throw new Error("User is not a student or has no profile.");
    }

    const details = await this.enrollmentRepo.findStudentSemesterDetails(
      profile.id,
      semesterVO
    );

    if (details.length === 0) return [];

    return details.map((detail) => {
      const gradesDto = detail.grades.map(toGradeOutputDto);
      
      return {
        enrollmentId: detail.enrollment.id.value,
        courseName: detail.courseName,
        professorName: detail.professorName,
        grades: gradesDto,
        average: null,
        status: "En Progreso", 
        groupStats: [],
        weights: detail.weights.map(w => ({ type: w.type, weight: w.weight.value }))
      };
    });
  }
}
