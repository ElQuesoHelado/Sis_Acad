import { DomainError } from "@/domain/errors/base/error.base.js";

export class OutsideEnrollmentPeriodError extends DomainError {
  constructor(message: string = "La matrícula en laboratorios está fuera del periodo permitido") {
    super(message);
    this.name = "OutsideEnrollmentPeriodError";
  }
}