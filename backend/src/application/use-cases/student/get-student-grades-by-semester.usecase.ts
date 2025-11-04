import {
  type IEnrollmentRepository,
  type ITheoryGroupRepository,
  type ICourseRepository,
  type IGradeRepository,
  type IUserRepository,
  type IGradeWeightRepository,
} from "@/domain/repositories/index.js";
import { Id, AcademicSemester } from "@/domain/value-objects/index.js";
import { toGradeOutputDto } from "@/application/mappers/grade.mapper.js";
import {
  type StudentCourseGradesDto,
  type CourseStatus,
} from "@/application/dtos/student-grades.dto.js";
import type { Grade } from "@/domain/entities/grade.entity.js";
import type { GradeWeight } from "@/domain/entities/grade-weight.entity.js";
import type { GradeType } from "@/domain/enums/grade-type.enum.js";

const APPROVAL_SCORE = 10.5;

interface CalculationResult {
  average: number | null;
  status: CourseStatus;
}

/**
 * Calculates the final average and status based on the configured weights.
 */
function calculateAverageAndStatus(
  grades: Grade[],
  weights: GradeWeight[],
): CalculationResult {
  const totalWeightCheck = weights.reduce((sum, w) => sum + w.weight.value, 0);
  if (weights.length === 0 || totalWeightCheck === 0) {
    return { average: null, status: "En Progreso" };
  }

  const weightMap = new Map<GradeType, number>();
  for (const w of weights) {
    weightMap.set(w.type, w.weight.value);
  }

  const gradeMap = new Map<GradeType, number>();
  for (const g of grades) {
    gradeMap.set(g.type, g.score.value);
  }

  let finalAverage = 0;
  let allGradesPosted = true;

  for (const [type, weight] of weightMap.entries()) {
    const score = gradeMap.get(type);

    if (score === undefined || score === null) {
      allGradesPosted = false;
    } else {
      finalAverage += score * (weight / 100);
    }
  }

  finalAverage = Math.round(finalAverage * 100) / 100;

  let status: CourseStatus = "En Progreso";
  if (allGradesPosted) {
    status = finalAverage >= APPROVAL_SCORE ? "Aprobado" : "Desaprobado";
  }

  return { average: finalAverage, status };
}

export class GetStudentGradesBySemesterUseCase {
  constructor(
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly theoryGroupRepository: ITheoryGroupRepository,
    private readonly courseRepository: ICourseRepository,
    private readonly gradeRepository: IGradeRepository,
    private readonly userRepository: IUserRepository,
    private readonly gradeWeightRepository: IGradeWeightRepository,
  ) {}

  /**
   * Executes the use case to fetch student grades per course for a semester.
   */
  public async execute(
    studentProfileId: string,
    semester: string,
  ): Promise<StudentCourseGradesDto[]> {
    const studentIdVO = Id.create(studentProfileId);
    const semesterVO = AcademicSemester.create(semester);

    const courseGradesList: StudentCourseGradesDto[] = [];

    const allEnrollments =
      await this.enrollmentRepository.findByStudent(studentIdVO);

    for (const enrollment of allEnrollments) {
      const theoryGroup = await this.theoryGroupRepository.findById(
        enrollment.theoryGroupId,
      );
      if (!theoryGroup || !theoryGroup.semester.equals(semesterVO)) {
        continue;
      }

      const course = await this.courseRepository.findById(theoryGroup.courseId);
      const professor = await this.userRepository.findById(
        theoryGroup.professorId,
      );
      const professorName = professor
        ? `${professor.name} ${professor.surname}`
        : "Pending";

      const grades = await this.gradeRepository.findByEnrollmentId(
        enrollment.id,
      );
      const weights = await this.gradeWeightRepository.findByTheoryGroupId(
        theoryGroup.id,
      );

      const gradeDtos = grades.map(toGradeOutputDto);
      const { average, status } = calculateAverageAndStatus(grades, weights);

      courseGradesList.push({
        enrollmentId: enrollment.id.value,
        courseName: course?.name ?? "Curso desconocido",
        professorName: professorName,
        grades: gradeDtos,
        average: average,
        status: status,
      });
    }

    return courseGradesList;
  }
}
