import { AppDataSource } from "../data-source"
import { Student } from "../entity/Student"

export class SecretaryService {
  private studentRepository = AppDataSource.getRepository(Student)
  async viewAllStudents(): Promise<any[]> {
    try {
      const students = await this.studentRepository.find()
      return students.map((student) => ({
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        enrollmentYear: student.enrollmentYear,
      }))
    } catch (error: any) {
      throw new Error(`Error fetching students: ${error.message}`)
    }
  }
}