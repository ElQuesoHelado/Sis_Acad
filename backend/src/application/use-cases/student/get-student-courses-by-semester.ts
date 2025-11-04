import {
  type IEnrollmentRepository,
  type ITheoryGroupRepository,
  type ICourseRepository,
  type IUserRepository,
} from "@/domain/repositories/index.js";
import { Id, AcademicSemester } from "@/domain/value-objects/index.js";
import {
  type StudentCourseDto,
  type LabEnrollmentStatus,
} from "@/application/dtos/student-course.dto.js";
import { CourseType } from "@/domain/enums/course-type.enum.js";
import type { Course } from "@/domain/entities/course.entity.js";
import type { Enrollment } from "@/domain/entities/enrollment.entity.js";

export class GetStudentCoursesBySemesterUseCase {
  constructor(
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly theoryGroupRepository: ITheoryGroupRepository,
    private readonly courseRepository: ICourseRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Gets the list of enrolled courses for a student in a specific semester.
   */
  public async execute(
    studentProfileId: string,
    semester: string,
  ): Promise<StudentCourseDto[]> {
    const studentIdVO = Id.create(studentProfileId);
    const semesterVO = AcademicSemester.create(semester);

    const enrolledCourses: StudentCourseDto[] = [];

    const allEnrollments =
      await this.enrollmentRepository.findByStudent(studentIdVO);

    for (const enrollment of allEnrollments) {
      const theoryGroup = await this.theoryGroupRepository.findById(
        enrollment.theoryGroupId,
      );
      if (!theoryGroup || !theoryGroup.semester.equals(semesterVO)) {
        continue; // Not in the requested semester
      }

      // 3. Load associated Course
      const course = await this.courseRepository.findById(theoryGroup.courseId);
      if (!course) continue; // Data integrity issue

      const professor = await this.userRepository.findById(
        theoryGroup.professorId,
      );
      const professorName = professor
        ? `${professor.name} ${professor.surname}`
        : "Pendiente";

      const labStatus = this.getLabStatus(course, enrollment);

      enrolledCourses.push({
        enrollmentId: enrollment.id.value,
        courseCode: course.code.value,
        courseName: course.name,
        credits: course.credits.value,
        professorName: professorName,
        labStatus: labStatus,
      });
    }

    return enrolledCourses;
  }

  /**
   * Determines the lab enrollment status based on course type and enrollment.
   */
  private getLabStatus(
    course: Course,
    enrollment: Enrollment,
  ): LabEnrollmentStatus {
    if (course.type === CourseType.THEORY) {
      return "N/A"; // Course has no lab
    }
    if (enrollment.labGroupId) {
      return "Matriculado";
    }
    return "Sin Matricula";
  }
}
