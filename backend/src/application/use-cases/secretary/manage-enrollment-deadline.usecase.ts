import { type ISystemConfigRepository } from "@/domain/repositories/isystem-config.repository.js";

export interface EnrollmentPeriodDto {
  startDate: string | null;
  endDate: string | null;
}

export class ManageEnrollmentDeadlineUseCase {
  constructor(private readonly configRepo: ISystemConfigRepository) {}

  // Establecer periodo de inscripción completo (Formato ISO string)
  public async setEnrollmentPeriod(period: { startDate: string; endDate: string }): Promise<void> {
    await this.configRepo.set("LAB_ENROLLMENT_START_DATE", period.startDate);
    await this.configRepo.set("LAB_ENROLLMENT_END_DATE", period.endDate);
    // Mantener backwards compatibility - usar endDate como deadline principal
    await this.configRepo.set("LAB_ENROLLMENT_DEADLINE", period.endDate);
  }

  // Establecer fecha límite única (mantener backwards compatibility)
  public async setDeadline(isoDate: string): Promise<void> {
    await this.configRepo.set("LAB_ENROLLMENT_DEADLINE", isoDate);
    await this.configRepo.set("LAB_ENROLLMENT_END_DATE", isoDate);
    // Si no existe fecha de inicio, mantenerla o poner una por defecto
    const currentStartDate = await this.configRepo.get("LAB_ENROLLMENT_START_DATE");
    if (!currentStartDate) {
      // Por ahora dejar la fecha de inicio como null o una fecha por defecto
      // Se podría usar la fecha actual o una fecha fija como 2020-01-01
      await this.configRepo.set("LAB_ENROLLMENT_START_DATE", new Date().toISOString());
    }
  }

  // Obtener periodo de inscripción
  public async getEnrollmentPeriod(): Promise<EnrollmentPeriodDto> {
    const startDate = await this.configRepo.get("LAB_ENROLLMENT_START_DATE");
    const endDate = await this.configRepo.get("LAB_ENROLLMENT_END_DATE");

    return {
      startDate,
      endDate
    };
  }

  // Obtener fecha límite (mantener backwards compatibility)
  public async getDeadline(): Promise<string | null> {
    return await this.configRepo.get("LAB_ENROLLMENT_DEADLINE");
  }
}
