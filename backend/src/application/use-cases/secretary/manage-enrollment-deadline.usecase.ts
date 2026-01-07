import { type ISystemConfigRepository } from "@/domain/repositories/isystem-config.repository.js";

export class ManageEnrollmentDeadlineUseCase {
  constructor(private readonly configRepo: ISystemConfigRepository) {}

  // Establecer fecha límite (Formato ISO string)
  public async setDeadline(isoDate: string): Promise<void> {
    await this.configRepo.set("LAB_ENROLLMENT_DEADLINE", isoDate);
  }

  // Obtener fecha límite (para que el frontend sepa si bloquear botones)
  public async getDeadline(): Promise<string | null> {
    return await this.configRepo.get("LAB_ENROLLMENT_DEADLINE");
  }
}
