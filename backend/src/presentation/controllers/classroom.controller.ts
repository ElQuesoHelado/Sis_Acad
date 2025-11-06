import { type Response, type NextFunction } from "express";
import { type AuthRequest } from "../middlewares/auth.middleware.js";
import { type GetAllClassroomsUseCase } from "@/application/use-cases/classroom/index.js";

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
