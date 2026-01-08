import { type IEnrollmentRepository, type ILabGroupRepository, type IStudentProfileRepository, type IUserRepository } from "@/domain/repositories/index.js";
import { Id } from "@/domain/value-objects/index.js";

export interface StudentEnrolledInLabDto {
  studentId: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  email: string;
}

export class GetStudentsInLabUseCase {
  constructor(
    private readonly enrollmentRepo: IEnrollmentRepository,
    private readonly labGroupRepo: ILabGroupRepository,
    private readonly studentProfileRepo: IStudentProfileRepository,
    private readonly userRepo: IUserRepository
  ) {}

  public async execute(labGroupId: string): Promise<StudentEnrolledInLabDto[]> {
    // Validate labGroupId before converting to Id
    if (!labGroupId) {
      throw new Error('labGroupId es requerido.');
    }

    const labId = Id.create(labGroupId);

    // Verificar que el laboratorio existe
    const labGroup = await this.labGroupRepo.findById(labId);
    if (!labGroup) {
      throw new Error(`Laboratorio con ID ${labGroupId} no encontrado.`);
    }

    // Obtener todas las matrículas asociadas a este laboratorio
    const enrollments = await this.enrollmentRepo.findByLabGroup(labId);

    // Obtener información detallada de cada estudiante
    const studentsInfo = await Promise.all(
      enrollments.map(async (enrollment: any) => {
        const studentProfile = await this.studentProfileRepo.findById(enrollment.studentId);
        if (!studentProfile) {
          throw new Error(`Perfil de estudiante no encontrado para la matrícula ${enrollment.id.value}`);
        }

        const user = await this.userRepo.findById(studentProfile.userId);
        if (!user) {
          throw new Error(`Usuario no encontrado para el perfil de estudiante ${studentProfile.id.value}`)
        }

        return {
          studentId: user.id.value,
          studentCode: studentProfile.studentCode.value,
          firstName: user.name,
          lastName: user.surname,
          email: user.email.value
        };
      })
    );

    return studentsInfo;
  }
}