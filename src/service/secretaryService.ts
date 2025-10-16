import { AppDataSource } from "../data-source";
import { Student } from "../entity/Student";

export class SecretaryService {
  private studentRepository = AppDataSource.getRepository(Student);

  async viewAllStudents(
    page: number,
    pageSize: number
  ): Promise<{
    data: any[];
    total: number;
    page: number;
    lastPage: number;
  }> {
    try {
      const [students, total] = await this.studentRepository.findAndCount({
        skip: (page - 1) * pageSize,
        take: pageSize,
      });


      const studentData = students.map((student) => ({
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        enrollmentYear: student.enrollmentYear,
      }));

      return {
        data: studentData,
        total,
        page,
        lastPage: Math.ceil(total / pageSize),
      };
    } catch (error: any) {
      throw new Error(`Error fetching students: ${error.message}`);
    }
  }
}
