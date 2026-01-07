import { type Request, type Response, type NextFunction } from "express";
import { type CreateLabGroupUseCase } from "@/application/use-cases/secretary/create-lab-group.usecase.js";
import { type ManageEnrollmentDeadlineUseCase } from "@/application/use-cases/secretary/manage-enrollment-deadline.usecase.js";
import { type GetAllLabGroupsUseCase } from "@/application/use-cases/secretary/get-all-lab-groups.usecase.js";

// Factory para Crear Laboratorio
export const makeCreateLabGroupController = (useCase: CreateLabGroupUseCase) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await useCase.execute(req.body);
      res.status(201).json({ message: "Laboratorio creado exitosamente" });
    } catch (error) {
      next(error);
    }
  };
};

// Factory para Obtener Laboratorios (Tabla)
export const makeGetAllLabGroupsController = (useCase: GetAllLabGroupsUseCase) => {
  return async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const labs = await useCase.execute();
      res.status(200).json(labs);
    } catch (error) {
      next(error);
    }
  };
};

// Factory para Establecer Plazo
export const makeSetDeadlineController = (useCase: ManageEnrollmentDeadlineUseCase) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await useCase.setDeadline(req.body.deadline);
      res.status(200).json({ message: "Plazo de inscripción actualizado correctamente" });
    } catch (error) {
      next(error);
    }
  };
};

// Factory para Obtener Plazo actual
export const makeGetDeadlineController = (useCase: ManageEnrollmentDeadlineUseCase) => {
  return async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const deadline = await useCase.getDeadline();
      res.status(200).json({ deadline });
    } catch (error) {
      next(error);
    }
  };
};
