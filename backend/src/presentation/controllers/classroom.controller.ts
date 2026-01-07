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
      const { classroomId } = req.params;
      const { semester } = req.query;

      if (!semester) {
        return res.status(400).json({ message: "Semester query param is required (e.g., 2024-I)" });
      }

      const schedule = await useCase.execute(classroomId as string, String(semester));
      res.status(200).json(schedule);
    } catch (error) {
      next(error);
    }
  };
};
