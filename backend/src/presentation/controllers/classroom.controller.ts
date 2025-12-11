import { type Response, type Request, type NextFunction } from "express";
import { type AuthRequest } from "../middlewares/auth.middleware.js";
import { type GetAllClassroomsUseCase } from "@/application/use-cases/classroom/index.js";
import type { GetClassroomScheduleUseCase } from "@/application/use-cases/classroom/get-classroom-schedule.usecase.js";

export const makeGetAllClassroomsController = (
  useCase: GetAllClassroomsUseCase,
) => {
  return async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const classrooms = await useCase.execute();
      return res.status(200).json(classrooms);
    } catch (error) {
      next(error);
    }
  };
};

export const makeGetClassroomScheduleController = (useCase: GetClassroomScheduleUseCase) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Missing profile ID" });
      }

      const { semester } = req.query;
      const result = await useCase.execute(id, semester as string);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
};
