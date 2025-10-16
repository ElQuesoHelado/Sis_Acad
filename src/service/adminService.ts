import { AppDataSource } from "../data-source"
import { Teacher } from "../entity/Teacher"

export class AdminService {
  private teacherRepository = AppDataSource.getRepository(Teacher)
  async viewAllTeachers(): Promise<any[]> {
    try {
      const teachers = await this.teacherRepository.find()
      return teachers.map((teacher) => ({
        id: teacher.id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        specialty: teacher.specialty,
      }))
    } catch (error: any) {
      throw new Error(`Error fetching teachers: ${error.message}`)
    }
  }
}