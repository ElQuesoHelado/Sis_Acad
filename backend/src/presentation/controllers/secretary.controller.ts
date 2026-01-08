import { type Request, type Response, type NextFunction } from "express";
import { type CreateLabGroupUseCase } from "@/application/use-cases/secretary/create-lab-group.usecase.js";
import { type UpdateLabGroupCapacityUseCase } from "@/application/use-cases/secretary/update-lab-group-capacity.usecase.js";
import { type ManageEnrollmentDeadlineUseCase } from "@/application/use-cases/secretary/manage-enrollment-deadline.usecase.js";
import { type GetAllLabGroupsUseCase } from "@/application/use-cases/secretary/get-all-lab-groups.usecase.js";
import { type GetAllCoursesUseCase } from "@/application/use-cases/admin/get-all-courses.usecase.js";

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

// Factory para Actualizar Capacidad de Laboratorio
export const makeUpdateLabGroupCapacityController = (useCase: UpdateLabGroupCapacityUseCase) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const labGroupId = req.params.labGroupId;
      if (!labGroupId) {
        return res.status(400).json({ message: "labGroupId is required" });
      }

      const input = {
        labGroupId: labGroupId,
        newCapacity: req.body.newCapacity
      };
      await useCase.execute(input);
      res.status(200).json({ message: "Capacidad de laboratorio actualizada exitosamente" });
    } catch (error) {
      next(error);
    }
  };
};

// Factory para Obtener Todos los Cursos
export const makeGetAllCoursesController = (useCase: GetAllCoursesUseCase) => {
  return async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const courses = await useCase.execute();
      res.status(200).json(courses);
    } catch (error) {
      next(error);
    }
  };
};

// Factory para Establecer Plazo (mantener backwards compatibility)
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

// Factory para Obtener Plazo actual (mantener backwards compatibility)
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

// Factory para Establecer Periodo de Inscripción
export const makeSetEnrollmentPeriodController = (useCase: ManageEnrollmentDeadlineUseCase) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await useCase.setEnrollmentPeriod(req.body.period);
      res.status(200).json({ message: "Periodo de inscripción actualizado correctamente" });
    } catch (error) {
      next(error);
    }
  };
};

// Factory para Obtener Periodo de Inscripción actual
export const makeGetEnrollmentPeriodController = (useCase: ManageEnrollmentDeadlineUseCase) => {
  return async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const period = await useCase.getEnrollmentPeriod();
      res.status(200).json(period);
    } catch (error) {
      next(error);
    }
  };
};
